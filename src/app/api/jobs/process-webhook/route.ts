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
} from "@/lib/fetch";
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
const findAutomation = (automationId: string) =>
  automationService.getByIdForWebhook(automationId);

// Initialize QStash receiver for signature verification
const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

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

  try {
    // Match keywords for DM
    if (webhook_payload.entry[0].messaging) {
      matcher = await matchKeyword(
        webhook_payload.entry[0].messaging[0].message.text,
        "DM",
      );
    }

    // Match keywords for Comment
    if (webhook_payload.entry[0].changes) {
      matcher = await matchKeyword(
        webhook_payload.entry[0].changes[0].value.text,
        "COMMENT",
      );
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

        // Build execution context (shared by both new and old executors)
        const context = {
          automationId: matcher.automationId,
          userId: automation.userId!,
          token: integration.token,
          pageId: webhook_payload.entry[0].id,
          senderId: isMessage
            ? webhook_payload.entry[0].messaging[0].sender.id
            : webhook_payload.entry[0].changes[0].value.from.id,
          messageText: isMessage
            ? webhook_payload.entry[0].messaging[0].message.text
            : webhook_payload.entry[0].changes[0].value.text,
          commentId: isComment
            ? webhook_payload.entry[0].changes[0].value.id
            : undefined,
          mediaId: isComment
            ? webhook_payload.entry[0].changes[0].value.media?.id
            : undefined,
          triggerType: (isMessage ? "DM" : "COMMENT") as "DM" | "COMMENT",
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

          // If new runner succeeded, return result
          if (flowResult.success) {
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
        const automation = await findAutomation(customer_history.automationId);

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
