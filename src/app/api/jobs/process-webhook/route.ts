import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { webhookService } from "@/services/webhook.service";
import { analyticsService } from "@/services/analytics.service";
import { automationService } from "@/services/automation.service";
import {
  sendDM,
  sendPrivateMessage,
  replyToComment,
  sendCarouselMessage,
  getUserProfile,
  checkIfFollower,
  getMentionedComment,
  getMentionedMedia,
} from "@/lib/fetch";
import { upsertContact } from "@/services/contact.service";
import { generateGeminiResponse } from "@/lib/gemini";
import { client } from "@/lib/prisma";
// New flow-runner architecture (primary)
import {
  initializeNodeRegistry,
  runWorkflow,
  type ExecutionContext,
  type FlowNodeRuntime,
  type FlowEdgeRuntime,
} from "@/lib/flow-runner";
// Old flow-executor (fallback for safety)
import { executeFlow as executeFlowLegacy } from "@/lib/flow-executor";
import type { WebhookJobPayload } from "@/lib/queue";

// Service method aliases for compatibility
const matchKeyword = webhookService.matchKeyword.bind(webhookService);
const getKeywordAutomation =
  webhookService.getKeywordAutomation.bind(webhookService);
const getKeywordPost = webhookService.getKeywordPost.bind(webhookService);
const getChatHistory = webhookService.getChatHistory.bind(webhookService);
const createChatHistory = webhookService.createChatHistory.bind(webhookService);
const trackResponses = webhookService.trackResponses.bind(webhookService);
const trackAnalytics = async (userId: string, type: "dm" | "comment") => {
  return analyticsService.trackEvent(userId, type);
};
const findAutomation = (automationId: string, pageId: string) =>
  automationService.getByIdForWebhook(automationId, pageId);

// Initialize QStash receiver for signature verification
const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

// =================================================================
// COMMENT DEDUPLICATION
// In-memory tracking of processed comments to prevent duplicate replies.
// Uses Map with timestamps for TTL-based cleanup (1 hour retention).
// =================================================================
const processedComments = new Map<string, number>();
const COMMENT_TTL_MS = 60 * 60 * 1000; // 1 hour

function isCommentProcessed(commentId: string): boolean {
  const timestamp = processedComments.get(commentId);
  if (!timestamp) return false;
  // Check if TTL expired
  if (Date.now() - timestamp > COMMENT_TTL_MS) {
    processedComments.delete(commentId);
    return false;
  }
  return true;
}

function markCommentProcessed(commentId: string): void {
  processedComments.set(commentId, Date.now());
  // Cleanup old entries periodically (every 100 entries)
  if (processedComments.size > 100) {
    const now = Date.now();
    for (const [id, ts] of processedComments.entries()) {
      if (now - ts > COMMENT_TTL_MS) {
        processedComments.delete(id);
      }
    }
  }
}

export async function POST(req: NextRequest) {
  // Verify request is from QStash
  const signature = req.headers.get("upstash-signature");
  const body = await req.text();

  if (process.env.NODE_ENV === "production" && signature) {
    try {
      await receiver.verify({
        signature,
        body,
      });
    } catch (error) {
      console.error("QStash: Invalid signature", error);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const jobPayload: WebhookJobPayload = JSON.parse(body);
  const webhook_payload = jobPayload.webhookPayload;

  console.log("Processing queued webhook job:", {
    receivedAt: jobPayload.receivedAt,
    retryCount: jobPayload.retryCount || 0,
  });

  let matcher;

  // =================================================================
  // CONTACT INGESTION (Zero-Patchwork Protocol)
  // Ensure we capture contact state for every interaction
  // =================================================================
  try {
    const entry = webhook_payload.entry[0];
    const pageId = entry.id;
    let senderId: string | undefined;

    if (entry.messaging) {
      senderId = entry.messaging[0].sender.id;
    } else if (entry.changes) {
      senderId = entry.changes[0].value.from.id;
    }

    if (senderId && pageId) {
      // Fetch token to perform API checks
      const token = await webhookService.getIntegrationToken(pageId);
      if (token) {
        // Opportunistic checks
        const [profile, isFollower] = await Promise.all([
          getUserProfile(senderId, token),
          checkIfFollower(pageId, senderId, token),
        ]);

        // Update DB
        await upsertContact(senderId, pageId, {
          name: profile?.name,
          username: profile?.username,
          isFollower: isFollower ?? undefined, // Only update if not null
        });
        console.log("Contact ingested:", { senderId, isFollower });
      }
    }
  } catch (ingestError) {
    console.error("Contact ingestion failed:", ingestError);
    // Non-blocking: Continue flow execution even if ingestion fails
  }

  try {
    // Match keywords for DM
    if (webhook_payload.entry[0].messaging) {
      const messaging = webhook_payload.entry[0].messaging[0];

      // Skip echo messages (messages we sent ourselves)
      if (messaging?.message?.is_echo) {
        console.log("Skipping echo message");
        return NextResponse.json(
          { message: "Echo message ignored" },
          { status: 200 },
        );
      }
      // =================================================================
      // POSTBACK HANDLING: Follower Recheck
      // Gateway Pattern: Validate → Guard → Execute → Respond
      // Zero-Patchwork: All IDOR validation in service layer
      // =================================================================
      if (messaging?.postback?.payload) {
        const payload = messaging.postback.payload as string;
        const RECHECK_PREFIX = "SWOOPIN_RECHECK_FOLLOWER::";

        if (payload.startsWith(RECHECK_PREFIX)) {
          // 1. Extract inputs
          const automationId = payload.replace(RECHECK_PREFIX, "");
          const pageId = webhook_payload.entry[0].id;
          const senderId = messaging.sender.id;

          console.log("Follower recheck postback:", {
            automationId,
            pageId,
            senderId,
          });

          // 2. Validate & Guard (service handles IDOR protection)
          const automation =
            await webhookService.getAutomationForFollowerRecheck(
              automationId,
              pageId,
            );

          if (!automation) {
            return NextResponse.json(
              { error: { code: "UNAUTHORIZED", message: "Access denied" } },
              { status: 403 },
            );
          }

          // 3. Execute
          initializeNodeRegistry();

          const context: ExecutionContext = {
            automationId: automation.id,
            userId: automation.userId,
            token: automation.token,
            pageId,
            senderId,
            triggerType: "DM",
          };

          try {
            const result = await runWorkflow(
              automation.flowNodes as FlowNodeRuntime[],
              automation.flowEdges as FlowEdgeRuntime[],
              context,
            );

            // Track analytics
            await trackAnalytics(automation.userId, "dm").catch(console.error);

            // 4. Respond
            return NextResponse.json(
              { message: "Follower recheck executed", success: result.success },
              { status: 200 },
            );
          } catch (flowError) {
            console.error("Follower recheck flow error:", flowError);
            return NextResponse.json(
              {
                error: {
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Flow execution failed",
                },
              },
              { status: 500 },
            );
          }
        }
      }

      // Check for story mention
      const isStoryMention = messaging?.message?.attachments?.some(
        (a: any) => a.type === "story_mention",
      );

      // Check for post share
      const isPostShare = messaging?.message?.attachments?.some(
        (a: any) => a.type === "share" || a.type === "ig_post",
      );

      // Get text if available
      const messageText = messaging?.message?.text;

      if (messageText) {
        matcher = await matchKeyword(messageText, "DM");
      } else if (isStoryMention) {
        // For story mentions without text, match as STORY_REPLY trigger
        console.log(
          "Story mention received, checking for STORY_REPLY automation",
        );
        // Will be handled by flow execution with STORY_REPLY trigger
      } else if (isPostShare) {
        // Post shares without text - just acknowledge
        console.log("Post share received, no text to match");
      }
    }

    // Match keywords for Comment & Mentions
    if (!matcher && webhook_payload.entry[0].changes) {
      const change = webhook_payload.entry[0].changes[0];
      const pageId = webhook_payload.entry[0].id;

      // Handle Mentions
      if (change.field === "mentions") {
        console.log("Processing mention webhook:", change.value);
        const { comment_id, media_id } = change.value;
        const token = await webhookService.getIntegrationToken(pageId);

        if (token) {
          let text = "";
          let senderId = "";

          if (comment_id) {
            const commentRes = await getMentionedComment(comment_id, token);
            if (commentRes.success && commentRes.data) {
              text = commentRes.data.text || "";
              senderId = commentRes.data.from?.id;
            }
          } else if (media_id) {
            const mediaRes = await getMentionedMedia(media_id, token);
            if (mediaRes.success && mediaRes.data) {
              text = mediaRes.data.caption || "";
              senderId = mediaRes.data.owner?.id;
            }
          }

          if (text) {
            // Check for specific MENTION automation first
            matcher = await matchKeyword(text, "MENTION");

            // Allow Mention to fallback to generic keywords if needed?
            // For now, let's keep it strict to what matchKeyword supports.
            // But we should inject the senderId back into the payload or context if we found it
            // because subsequent logic expects senderId in payload for context construction.
            // We'll handle this in context construction.
            if (senderId) {
              (change.value as any).sender_id_fetched = senderId;
            }
            (change.value as any).text_fetched = text;
          }
        }
      }

      // Handle Comments (existing logic)
      if (change.field === "comments") {
        const senderId = change?.value?.from?.id;
        const parentId = change?.value?.parent_id;

        // Infinite loop protection: Ignore comments from the page itself
        if (senderId === pageId) {
          console.log("Skipping comment from self (infinite loop protection)");
          return NextResponse.json(
            { message: "Self-comment ignored" },
            { status: 200 },
          );
        }

        // Infinite loop protection: Ignore comment REPLIES (has parent_id)
        // These are sub-comments, which include bot's own replies to user comments
        if (parentId) {
          console.log(
            "Skipping comment reply (sub-comment) - infinite loop protection",
          );
          return NextResponse.json(
            { message: "Comment reply ignored" },
            { status: 200 },
          );
        }

        const commentText = change?.value?.text;
        if (commentText) {
          matcher = await matchKeyword(commentText, "COMMENT");
        }
      }
    }

    if (matcher && matcher.automationId) {
      console.log("Matched automation:", matcher.automationId);

      const automation = await getKeywordAutomation(matcher.automationId, true);
      if (!automation || !automation.active) {
        return NextResponse.json(
          { message: "Automation inactive" },
          { status: 200 },
        );
      }

      // Check if automation has flow nodes
      const hasFlowNodes =
        automation.flowNodes && automation.flowNodes.length > 0;

      if (hasFlowNodes) {
        const isMessage = !!webhook_payload.entry[0].messaging;
        const isComment = !!webhook_payload.entry[0].changes?.find(
          (c: any) => c.field === "comments",
        );

        const isMention = !!webhook_payload.entry[0].changes?.find(
          (c: any) => c.field === "mentions",
        );
        const mentionChange = isMention
          ? webhook_payload.entry[0].changes[0]
          : null;

        // Check post attachment for comments
        if (isComment) {
          const mediaId = webhook_payload.entry[0].changes[0].value.media?.id;
          if (mediaId) {
            const postMatch = await getKeywordPost(mediaId, automation.id);
            if (!postMatch) {
              return NextResponse.json(
                { message: "Post not attached" },
                { status: 200 },
              );
            }
          }
        }

        // Ensure user has a valid integration token
        const integration = automation.User?.integrations?.[0];
        if (!integration?.token) {
          console.error(
            "No valid integration token found for user:",
            automation.userId,
          );
          return NextResponse.json(
            { message: "No valid integration found", success: false },
            { status: 200 },
          );
        }

        // Determine Sender ID
        let senderId = "";
        if (isMessage) {
          senderId = webhook_payload.entry[0].messaging[0].sender.id;
        } else if (isComment) {
          senderId = webhook_payload.entry[0].changes[0].value.from.id;
        } else if (isMention && mentionChange) {
          senderId = (mentionChange.value as any).sender_id_fetched;
        }

        // Determine Message Text
        let messageText = "";
        if (isMessage) {
          messageText = webhook_payload.entry[0].messaging[0].message.text;
        } else if (isComment) {
          messageText = webhook_payload.entry[0].changes[0].value.text;
        } else if (isMention && mentionChange) {
          messageText = (mentionChange.value as any).text_fetched;
        }

        // Detect Story Mention (Message Attachment)
        const isStoryMention =
          isMessage &&
          webhook_payload.entry[0].messaging[0].message.attachments?.some(
            (a: any) => a.type === "story_mention",
          );

        if (isStoryMention && !messageText) {
          messageText = "[Story Mention]";
        }

        // Build execution context (shared by both new and old executors)
        const context = {
          automationId: matcher.automationId,
          userId: automation.userId!,
          token: integration.token,
          pageId: webhook_payload.entry[0].id,
          senderId,
          messageText,
          isStoryMention,
          commentId: isComment
            ? webhook_payload.entry[0].changes[0].value.id
            : isMention
              ? mentionChange.value.comment_id
              : undefined,
          mediaId: isComment
            ? webhook_payload.entry[0].changes[0].value.media?.id
            : isMention
              ? mentionChange.value.media_id
              : undefined,
          triggerType: ((matcher as any).isCatchAll
            ? isMessage
              ? isStoryMention
                ? "MENTION"
                : "DM" // Story Mentions now map to MENTION trigger
              : isMention
                ? "MENTION"
                : "COMMENT"
            : "KEYWORDS") as "DM" | "COMMENT" | "KEYWORDS" | "MENTION",
          userSubscription: automation.User?.subscription?.plan,
          userOpenAiKey: automation.User?.openAiKey || undefined,
        };

        // Try new flow-runner first, fall back to legacy if it fails
        try {
          console.log("[FlowExecution] Using new flow-runner architecture");

          // Initialize node registry
          initializeNodeRegistry();

          // Convert flow nodes to runtime format
          const runtimeNodes: FlowNodeRuntime[] = automation.flowNodes.map(
            (node) => ({
              nodeId: node.nodeId,
              type: node.type,
              subType: node.subType,
              label: node.label,
              config: (node.config as Record<string, unknown>) || {},
            }),
          );

          // Convert flow edges to runtime format
          const runtimeEdges: FlowEdgeRuntime[] = (
            automation.flowEdges || []
          ).map((edge) => ({
            edgeId: edge.edgeId,
            sourceNodeId: edge.sourceNodeId,
            targetNodeId: edge.targetNodeId,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
          }));

          // Execute flow using new runner
          const flowResult = await runWorkflow(
            runtimeNodes,
            runtimeEdges,
            context as ExecutionContext,
          );

          console.log("[FlowExecution] New runner result:", flowResult);

          // If new runner succeeded, track analytics and return result
          if (flowResult.success) {
            // Track analytics for dashboard (Zero-Patchwork: fire-and-forget)
            const analyticsType =
              context.triggerType === "COMMENT" ? "comment" : "dm";
            void trackAnalytics(automation.userId!, analyticsType).catch(
              console.error,
            );
            void trackResponses(
              matcher.automationId,
              analyticsType === "dm" ? "DM" : "COMMENT",
            ).catch(console.error);

            return NextResponse.json(
              {
                message: flowResult.message,
                success: flowResult.success,
                executionTimeMs: flowResult.executionTimeMs,
                engine: "flow-runner",
              },
              { status: 200 },
            );
          }

          // If new runner failed, try legacy as fallback
          console.warn(
            "[FlowExecution] New runner failed, trying legacy executor:",
            flowResult.message,
          );
          throw new Error(flowResult.message);
        } catch (newRunnerError) {
          // Fallback to legacy flow-executor
          console.warn(
            "[FlowExecution] Falling back to legacy flow-executor:",
            newRunnerError,
          );

          try {
            const legacyResult = await executeFlowLegacy(
              matcher.automationId,
              context,
            );
            console.log(
              "[FlowExecution] Legacy executor result:",
              legacyResult,
            );

            // Track analytics for dashboard (Zero-Patchwork: fire-and-forget)
            if (legacyResult.success) {
              const analyticsType =
                context.triggerType === "COMMENT" ? "comment" : "dm";
              void trackAnalytics(automation.userId!, analyticsType).catch(
                console.error,
              );
              void trackResponses(
                matcher.automationId,
                analyticsType === "dm" ? "DM" : "COMMENT",
              ).catch(console.error);
            }

            return NextResponse.json(
              {
                message: legacyResult.message,
                success: legacyResult.success,
                engine: "flow-executor-legacy",
              },
              { status: 200 },
            );
          } catch (legacyError) {
            console.error(
              "[FlowExecution] Both executors failed:",
              legacyError,
            );
            return NextResponse.json(
              {
                message: "Flow execution failed",
                success: false,
                error: String(legacyError),
              },
              { status: 200 },
            );
          }
        }
      }

      // Legacy execution path (for automations without flow nodes)
      console.log("No flow nodes, using legacy path");

      return NextResponse.json(
        { message: "Processed (legacy)" },
        { status: 200 },
      );
    }

    // Handle chat continuation (no keyword match but existing chat history)
    if (!matcher && webhook_payload.entry[0].messaging) {
      const customer_history = await getChatHistory(
        webhook_payload.entry[0].messaging[0].recipient.id,
        webhook_payload.entry[0].messaging[0].sender.id,
      );

      if (
        customer_history.history.length > 0 &&
        customer_history.automationId
      ) {
        const pageId = webhook_payload.entry[0].id;
        const automation = await findAutomation(
          customer_history.automationId,
          pageId,
        );

        if (
          automation?.User?.subscription?.plan === "PRO" &&
          automation.listener?.listener === "SMARTAI" &&
          automation.active
        ) {
          const chatHistory = customer_history.history.map(
            (msg: { role: string; content: string }) => ({
              role:
                msg.role === "user" ? ("user" as const) : ("model" as const),
              text: msg.content,
            }),
          );

          const systemPrompt = `${automation.listener?.prompt}: keep responses under 2 sentences`;
          const userMessage =
            webhook_payload.entry[0].messaging[0].message.text;

          const smart_ai_message = await generateGeminiResponse(
            systemPrompt,
            userMessage,
            chatHistory,
          );

          if (smart_ai_message) {
            await createChatHistory(
              automation.id,
              webhook_payload.entry[0].id,
              webhook_payload.entry[0].messaging[0].sender.id,
              webhook_payload.entry[0].messaging[0].message.text,
            );

            await createChatHistory(
              automation.id,
              webhook_payload.entry[0].id,
              webhook_payload.entry[0].messaging[0].sender.id,
              smart_ai_message,
            );

            const chatIntegration = automation.User?.integrations?.[0];
            if (!chatIntegration?.token) {
              console.error("No valid integration token for chat continuation");
              return NextResponse.json(
                { message: "No valid integration found" },
                { status: 200 },
              );
            }

            const direct_message = await sendDM(
              webhook_payload.entry[0].id,
              webhook_payload.entry[0].messaging[0].sender.id,
              smart_ai_message,
              chatIntegration.token,
            );

            if (direct_message.status === 200) {
              await trackAnalytics(automation.userId!, "dm").catch(
                console.error,
              );
              return NextResponse.json(
                { message: "Chat continued" },
                { status: 200 },
              );
            }
          }
        }
      }
    }

    return NextResponse.json(
      { message: "No matching automation" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Job processing error:", error);
    // Return 500 so QStash will retry
    return NextResponse.json(
      { error: "Processing failed", details: String(error) },
      { status: 500 },
    );
  }
}
