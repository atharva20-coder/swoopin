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
import { executeFlow, hasFlowNodes } from "@/lib/flow-executor";
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
        "DM"
      );
    }

    // Match keywords for Comment
    if (webhook_payload.entry[0].changes) {
      matcher = await matchKeyword(
        webhook_payload.entry[0].changes[0].value.text,
        "COMMENT"
      );
    }

    if (matcher && matcher.automationId) {
      console.log("Matched automation:", matcher.automationId);

      // Check if automation uses flow-based execution
      const useFlowExecution = await hasFlowNodes(matcher.automationId);

      if (useFlowExecution) {
        console.log("Using flow-based execution");

        const automation = await getKeywordAutomation(
          matcher.automationId,
          true
        );
        if (!automation || !automation.active) {
          return NextResponse.json(
            { message: "Automation inactive" },
            { status: 200 }
          );
        }

        const isMessage = !!webhook_payload.entry[0].messaging;
        const isComment = !!webhook_payload.entry[0].changes?.find(
          (c: any) => c.field === "comments"
        );

        // Check post attachment for comments
        if (isComment) {
          const mediaId = webhook_payload.entry[0].changes[0].value.media?.id;
          if (mediaId) {
            const postMatch = await getKeywordPost(mediaId, automation.id);
            if (!postMatch) {
              return NextResponse.json(
                { message: "Post not attached" },
                { status: 200 }
              );
            }
          }
        }

        const context = {
          automationId: matcher.automationId,
          userId: automation.userId!,
          token: automation.User?.integrations[0].token!,
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

        const flowResult = await executeFlow(matcher.automationId, context);
        console.log("Flow execution result:", flowResult);

        return NextResponse.json(
          { message: flowResult.message, success: flowResult.success },
          { status: 200 }
        );
      }

      // Legacy execution path (for automations without flow nodes)
      // ... keeping this simpler for now, the flow executor handles most cases
      console.log("No flow nodes, using legacy path");

      return NextResponse.json(
        { message: "Processed (legacy)" },
        { status: 200 }
      );
    }

    // Handle chat continuation (no keyword match but existing chat history)
    if (!matcher && webhook_payload.entry[0].messaging) {
      const customer_history = await getChatHistory(
        webhook_payload.entry[0].messaging[0].recipient.id,
        webhook_payload.entry[0].messaging[0].sender.id
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
            })
          );

          const systemPrompt = `${automation.listener?.prompt}: keep responses under 2 sentences`;
          const userMessage =
            webhook_payload.entry[0].messaging[0].message.text;

          const smart_ai_message = await generateGeminiResponse(
            systemPrompt,
            userMessage,
            chatHistory
          );

          if (smart_ai_message) {
            await createChatHistory(
              automation.id,
              webhook_payload.entry[0].id,
              webhook_payload.entry[0].messaging[0].sender.id,
              webhook_payload.entry[0].messaging[0].message.text
            );

            await createChatHistory(
              automation.id,
              webhook_payload.entry[0].id,
              webhook_payload.entry[0].messaging[0].sender.id,
              smart_ai_message
            );

            const direct_message = await sendDM(
              webhook_payload.entry[0].id,
              webhook_payload.entry[0].messaging[0].sender.id,
              smart_ai_message,
              automation.User?.integrations[0].token!
            );

            if (direct_message.status === 200) {
              await trackAnalytics(automation.userId!, "dm").catch(
                console.error
              );
              return NextResponse.json(
                { message: "Chat continued" },
                { status: 200 }
              );
            }
          }
        }
      }
    }

    return NextResponse.json(
      { message: "No matching automation" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Job processing error:", error);
    // Return 500 so QStash will retry
    return NextResponse.json(
      { error: "Processing failed", details: String(error) },
      { status: 500 }
    );
  }
}
