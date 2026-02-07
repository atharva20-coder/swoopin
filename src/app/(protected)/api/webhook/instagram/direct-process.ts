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
        "DM", // Postbacks come through messaging, treated as DM type for matching
      );
    }
    // Check for story mention
    else if (
      messaging?.message?.attachments?.some(
        (a: any) => a.type === "story_mention",
      )
    ) {
      const pageId = webhook_payload.entry[0].id;
      console.log(
        "Story mention received, matching MENTION automation for pageId:",
        pageId,
      );
      matcher = await matchKeyword("[Story Mention]", "MENTION", pageId);
    }
    // Match keywords for DM
    else if (messaging?.message?.text) {
      matcher = await matchKeyword(messaging.message.text, "DM");
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
          matcher = await matchKeyword(commentText, "COMMENT");
        }
      }
    }

    if (matcher && matcher.automationId) {
      console.log("Matched automation:", matcher.automationId);

      const automation = await getKeywordAutomation(matcher.automationId, true);
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

        const isMessage = !!webhook_payload.entry[0].messaging;
        const isComment = !!webhook_payload.entry[0].changes?.find(
          (c: any) => c.field === "comments",
        );
        const isMention = !!webhook_payload.entry[0].changes?.find(
          (c: any) => c.field === "mentions",
        );

        // Check post attachment for comments
        if (isComment) {
          const mediaId = webhook_payload.entry[0].changes[0].value.media?.id;
          if (mediaId) {
            const postMatch = await getKeywordPost(mediaId, automation.id);
            if (!postMatch) {
              return { message: "Post not attached to automation" };
            }
          }
        }

        // Detect if this is a story reply
        const messagePayload = webhook_payload.entry[0].messaging?.[0]?.message;
        const isStoryReply = !!(
          messagePayload?.reply_to?.story ||
          (messagePayload?.is_echo === false &&
            messagePayload?.attachments?.[0]?.type === "story_mention")
        );

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
          messageText: isMessage
            ? webhook_payload.entry[0].messaging[0].message.text
            : isMention
              ? webhook_payload.entry[0].changes[0].value.text
              : webhook_payload.entry[0].changes[0].value.text,
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
              : isMessage
                ? "DM"
                : "COMMENT") as "DM" | "COMMENT" | "STORY_REPLY" | "MENTION",
          isStoryReply,
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

    // Handle chat continuation
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
              return { message: "No valid integration found", success: false };
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
              return { message: "Chat continued", success: true };
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
