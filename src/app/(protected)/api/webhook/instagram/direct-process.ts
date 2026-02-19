/**
 * Direct webhook processing (fallback when QStash not configured)
 * Used for local development and testing
 */

import { webhookService } from "@/services/webhook.service";
import { analyticsService } from "@/services/analytics.service";
import { automationService } from "@/services/automation.service";
import { sendDM, sendCarouselMessage } from "@/lib/fetch";
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

export async function processWebhookDirectly(
  webhook_payload: any,
): Promise<{ message: string; success?: boolean }> {
  let matcher;

  try {
    const messaging = webhook_payload.entry[0].messaging?.[0];

    // Skip echo messages (messages we sent ourselves)
    if (messaging?.message?.is_echo) {
      console.log("Skipping echo message");
      return { message: "Echo message ignored", success: true };
    }

    // Check for postback event (button click)
    if (messaging?.postback?.payload) {
      console.log("Postback received:", messaging.postback.payload);
      matcher = await matchKeyword(
        messaging.postback.payload,
        "DM",
        webhook_payload.entry[0].id,
      );
    } else if (messaging?.message) {
      const pageId = webhook_payload.entry[0].id;
      const messagePayload = messaging.message;

      // Detect story reply and story mention
      const isStoryReply = !!(
        messagePayload?.reply_to?.story ||
        (messagePayload?.is_echo === false &&
          messagePayload?.attachments?.[0]?.type === "story_mention")
      );
      const isStoryMention = messagePayload?.attachments?.some(
        (a: any) => a.type === "story_mention",
      );

      // Extract attachment metadata for context
      const attachments = messagePayload?.attachments;
      let mediaDescription = "";
      if (attachments?.length > 0) {
        const att = attachments[0];
        if (att.type === "share" || att.type === "ig_post") {
          mediaDescription = att.payload?.title || "[Shared Post]";
        } else if (att.type === "image") {
          mediaDescription = "[Image received]";
        } else if (att.type === "video") {
          mediaDescription = "[Video received]";
        } else if (att.type === "audio") {
          mediaDescription = "[Audio received]";
        } else if (att.type === "story_mention") {
          mediaDescription = "[Story Mention]";
        } else {
          mediaDescription = `[${att.type || "Media"} received]`;
        }
      }

      const messageText = messagePayload?.text;

      // Priority: text → story reply → story mention → media-only DM
      if (messageText) {
        matcher = await matchKeyword(messageText, "DM", pageId);
      } else if (isStoryReply) {
        console.log("Story reply received, matching STORY_REPLY automation");
        matcher = await matchKeyword(
          mediaDescription || "[Story Reply]",
          "STORY_REPLY",
          pageId,
        );
      } else if (isStoryMention) {
        console.log(
          "Story mention received, matching MENTION automation for pageId:",
          pageId,
        );
        matcher = await matchKeyword("[Story Mention]", "MENTION", pageId);
      } else if (attachments?.length > 0) {
        console.log("Media-only DM received, matching DM automation");
        matcher = await matchKeyword(mediaDescription, "DM", pageId);
      }
    }

    // Match keywords for Comment or Mentions
    if (!matcher && webhook_payload.entry[0].changes) {
      const change = webhook_payload.entry[0].changes[0];
      const pageId = webhook_payload.entry[0].id;

      // Handle Mentions
      if (change?.field === "mentions") {
        const commentText = change?.value?.text;
        if (commentText) {
          console.log("Mention webhook received, matching for pageId:", pageId);
          matcher = await matchKeyword(commentText, "MENTION", pageId);
        }
      }
      // Handle Comments
      else if (change?.field === "comments") {
        const commentText = change?.value?.text;
        if (commentText) {
          matcher = await matchKeyword(commentText, "COMMENT", pageId);
        }
      }
    }

    if (matcher && matcher.automationId) {
      console.log("Matched automation:", matcher.automationId);

      const isMessage = !!webhook_payload.entry[0].messaging;
      const isComment = !!webhook_payload.entry[0].changes?.find(
        (c: any) => c.field === "comments",
      );
      const isMention = !!webhook_payload.entry[0].changes?.find(
        (c: any) => c.field === "mentions",
      );
      const isDm = isMessage && !isMention;
      const automation = await getKeywordAutomation(matcher.automationId, isDm);
      if (!automation || !automation.active) {
        return { message: "Automation inactive" };
      }

      // Check if automation has flow nodes
      const hasFlowNodes =
        automation.flowNodes && automation.flowNodes.length > 0;

      if (hasFlowNodes) {
        console.log("Using new flow-runner architecture");

        // Initialize node registry
        initializeNodeRegistry();

        // For comments: only require post match when automation has attached posts.
        // If no posts attached, allow comment on any post to trigger the flow.
        if (isComment) {
          const attachedPostIds =
            (automation as { posts?: { postid: string }[] }).posts?.map(
              (p) => p.postid,
            ) ?? [];
          if (attachedPostIds.length > 0) {
            const mediaId = webhook_payload.entry[0].changes[0].value.media?.id;
            if (mediaId) {
              const postMatch = await getKeywordPost(mediaId, automation.id);
              if (!postMatch) {
                return {
                  message:
                    "Post not attached to automation (comment must be on an attached post)",
                };
              }
            }
          }
        }

        // Detect story mention
        const isStoryMention =
          isMessage &&
          webhook_payload.entry[0].messaging[0]?.message?.attachments?.some(
            (a: any) => a.type === "story_mention",
          );

        // Detect Story Reply
        const storyMsgPayload =
          webhook_payload.entry[0].messaging?.[0]?.message;
        const isStoryReply = !!(
          storyMsgPayload?.reply_to?.story ||
          (storyMsgPayload?.is_echo === false &&
            storyMsgPayload?.attachments?.[0]?.type === "story_mention")
        );

        // Build messageText: provide semantic context for media DMs
        let contextMessageText = "";
        if (isMessage) {
          const rawText =
            webhook_payload.entry[0].messaging[0]?.message?.text || "";
          if (rawText) {
            contextMessageText = rawText;
          } else {
            const att =
              webhook_payload.entry[0].messaging[0]?.message?.attachments?.[0];
            if (att?.type === "share" || att?.type === "ig_post") {
              contextMessageText = att.payload?.title || "[User shared a post]";
            } else if (att?.type === "image") {
              contextMessageText = "[User sent an image]";
            } else if (att?.type === "video") {
              contextMessageText = "[User sent a video]";
            } else if (att?.type === "audio") {
              contextMessageText = "[User sent an audio message]";
            } else if (att?.type === "story_mention") {
              contextMessageText = "[User mentioned you in their story]";
            } else if (att) {
              contextMessageText = `[User sent ${att.type || "media"}]`;
            }
          }
        } else if (isMention) {
          contextMessageText =
            webhook_payload.entry[0].changes[0]?.value?.text || "";
        } else if (isComment) {
          contextMessageText =
            webhook_payload.entry[0].changes[0]?.value?.text || "";
        }

        if (isStoryMention && !contextMessageText) {
          contextMessageText = "[User mentioned you in their story]";
        }
        if (isStoryReply && !contextMessageText) {
          contextMessageText = "[User replied to your story]";
        }

        // Get mention data if this is a mention webhook
        let mentionData: { commentId?: string; mediaId?: string } | undefined;
        if (isMention) {
          const mentionChange = webhook_payload.entry[0].changes.find(
            (c: any) => c.field === "mentions",
          );
          mentionData = {
            commentId: mentionChange?.value?.comment_id,
            mediaId: mentionChange?.value?.media_id,
          };
        }

        // Ensure user has a valid integration token
        const integration = automation.User?.integrations?.[0];
        if (!integration?.token) {
          console.error(
            "No valid integration token found for user:",
            automation.userId,
          );
          return { message: "No valid integration found", success: false };
        }

        // Build execution context
        const context: ExecutionContext = {
          automationId: matcher.automationId,
          userId: automation.userId!,
          token: integration.token,
          pageId: webhook_payload.entry[0].id,
          senderId: isMessage
            ? webhook_payload.entry[0].messaging[0].sender.id
            : isMention
              ? webhook_payload.entry[0].changes[0].value.sender?.id ||
                webhook_payload.entry[0].id
              : webhook_payload.entry[0].changes[0].value.from.id,
          messageText: contextMessageText,
          isStoryMention,
          isStoryReply,
          commentId: isMention
            ? mentionData?.commentId
            : isComment
              ? webhook_payload.entry[0].changes[0].value.id
              : undefined,
          mediaId: isMention
            ? mentionData?.mediaId
            : isComment
              ? webhook_payload.entry[0].changes[0].value.media?.id
              : undefined,
          triggerType: (isMention
            ? "MENTION"
            : isStoryReply
              ? "STORY_REPLY"
              : isStoryMention
                ? "MENTION"
                : isMessage
                  ? "DM"
                  : "COMMENT") as "DM" | "COMMENT" | "STORY_REPLY" | "MENTION",
          userSubscription: automation.User?.subscription?.plan,
          userOpenAiKey: automation.User?.openAiKey || undefined,
        };

        // Try new flow-runner first, fall back to legacy if it fails
        try {
          console.log("[FlowExecution] Using new flow-runner architecture");

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
            context,
          );

          console.log("[FlowExecution] New runner result:", flowResult);

          if (flowResult.success) {
            return {
              message: flowResult.message,
              success: flowResult.success,
            };
          }

          // If new runner failed, try legacy
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
            return {
              message: legacyResult.message,
              success: legacyResult.success,
            };
          } catch (legacyError) {
            console.error(
              "[FlowExecution] Both executors failed:",
              legacyError,
            );
            return { message: "Flow execution failed", success: false };
          }
        }
      }

      // Legacy: basic message sending (no flow nodes)
      if (automation.listener) {
        if (
          automation.listener.listener === "MESSAGE" &&
          webhook_payload.entry[0].messaging
        ) {
          const legacyIntegration = automation.User?.integrations?.[0];
          if (!legacyIntegration?.token) {
            console.error("No valid integration token for legacy message");
            return { message: "No valid integration found", success: false };
          }

          const result = await sendDM(
            webhook_payload.entry[0].id,
            webhook_payload.entry[0].messaging[0].sender.id,
            automation.listener.prompt || "",
            legacyIntegration.token,
          );
          if (result.status === 200) {
            await trackResponses(automation.id, "DM");
            await trackAnalytics(automation.userId!, "dm").catch(console.error);
            return { message: "DM sent", success: true };
          }
        }
      }
    }

    // ================================================================
    // CHAT CONTINUATION (no keyword match but existing chat history)
    // Supports BOTH flow-based and legacy listener-based automations.
    // ================================================================
    if (!matcher && webhook_payload.entry[0].messaging) {
      const messaging = webhook_payload.entry[0].messaging[0];
      const recipientId = messaging?.recipient?.id;
      const senderIdForChat = messaging?.sender?.id;

      if (recipientId && senderIdForChat) {
        const customer_history = await getChatHistory(
          recipientId,
          senderIdForChat,
        );

        if (
          customer_history.history.length > 0 &&
          customer_history.automationId
        ) {
          const pageId = webhook_payload.entry[0].id;

          // Fetch automation with full flow data
          const automationForChat = await getKeywordAutomation(
            customer_history.automationId,
            true,
          );

          if (
            automationForChat?.active &&
            (automationForChat.User?.subscription?.plan === "PRO" ||
              automationForChat.User?.subscription?.plan === "ENTERPRISE")
          ) {
            const chatIntegration = automationForChat.User?.integrations?.[0];
            if (!chatIntegration?.token) {
              console.error("No valid integration token for chat continuation");
              return {
                message: "No valid integration found",
                success: false,
              };
            }

            // Extract user message (safe for media-only messages)
            const rawUserMessage = messaging?.message?.text || "";
            let userMessageForChat = rawUserMessage;
            if (!userMessageForChat) {
              const att = messaging?.message?.attachments?.[0];
              if (att?.type === "image")
                userMessageForChat = "[User sent an image]";
              else if (att?.type === "video")
                userMessageForChat = "[User sent a video]";
              else if (att?.type === "audio")
                userMessageForChat = "[User sent an audio message]";
              else if (att?.type === "share" || att?.type === "ig_post")
                userMessageForChat =
                  att.payload?.title || "[User shared a post]";
              else if (att)
                userMessageForChat = `[User sent ${att.type || "media"}]`;
              else userMessageForChat = "[Message received]";
            }

            // PATH A: Flow-based automation (has flow nodes with SmartAI)
            const hasFlowNodes =
              automationForChat.flowNodes &&
              automationForChat.flowNodes.length > 0;
            const hasSmartAINode = hasFlowNodes
              ? automationForChat.flowNodes.some(
                  (n: { subType: string | null }) => n.subType === "SMARTAI",
                )
              : false;

            if (hasFlowNodes && hasSmartAINode) {
              console.log(
                "Chat continuation: re-running flow-based automation",
                customer_history.automationId,
              );

              initializeNodeRegistry();

              const context: ExecutionContext = {
                automationId: customer_history.automationId,
                userId: automationForChat.userId!,
                token: chatIntegration.token,
                pageId,
                senderId: senderIdForChat,
                messageText: userMessageForChat,
                triggerType: "DM",
                userSubscription: automationForChat.User?.subscription?.plan,
                userOpenAiKey: automationForChat.User?.openAiKey || undefined,
              };

              try {
                const flowResult = await runWorkflow(
                  automationForChat.flowNodes as FlowNodeRuntime[],
                  automationForChat.flowEdges as FlowEdgeRuntime[],
                  context,
                );

                if (flowResult.success) {
                  await trackAnalytics(automationForChat.userId!, "dm").catch(
                    console.error,
                  );
                  return {
                    message: "Chat continued (flow)",
                    success: true,
                  };
                }
                console.warn(
                  "Chat continuation flow failed:",
                  flowResult.message,
                );
              } catch (flowError) {
                console.error("Chat continuation flow error:", flowError);
              }
            }

            // PATH B: Legacy listener-based automation
            if (
              automationForChat.listener?.listener === "SMARTAI" &&
              automationForChat.listener?.prompt
            ) {
              console.log(
                "Chat continuation: using legacy listener",
                customer_history.automationId,
              );

              const chatHistory = customer_history.history.map(
                (msg: { role: string; content: string }) => ({
                  role:
                    msg.role === "user"
                      ? ("user" as const)
                      : ("model" as const),
                  text: msg.content,
                }),
              );

              const systemPrompt = `${automationForChat.listener.prompt}: keep responses under 2 sentences`;

              const smart_ai_message = await generateGeminiResponse(
                systemPrompt,
                userMessageForChat,
                chatHistory,
              );

              if (smart_ai_message) {
                await createChatHistory(
                  automationForChat.id,
                  pageId,
                  senderIdForChat,
                  userMessageForChat,
                );

                await createChatHistory(
                  automationForChat.id,
                  pageId,
                  senderIdForChat,
                  smart_ai_message,
                );

                const direct_message = await sendDM(
                  pageId,
                  senderIdForChat,
                  smart_ai_message,
                  chatIntegration.token,
                );

                if (direct_message.status === 200) {
                  await trackAnalytics(automationForChat.userId!, "dm").catch(
                    console.error,
                  );
                  return { message: "Chat continued", success: true };
                }
              }
            }
          }
        }
      }
    }

    return { message: "No matching automation" };
  } catch (error) {
    console.error("Direct processing error:", error);
    throw error;
  }
}
