/**
 * Direct webhook processing (fallback when QStash not configured)
 * Used for local development and testing
 */

import { findAutomation } from "@/actions/automations/queries";
import {
  createChatHistory,
  getChatHistory,
  getKeywordAutomation,
  getKeywordPost,
  matchKeyword,
  trackResponses,
} from "@/actions/webhook/queries";
import { sendDM, sendCarouselMessage } from "@/lib/fetch";
import { openai } from "@/lib/openai";
import { client } from "@/lib/prisma";
import { trackAnalytics } from "@/actions/analytics";
import { OpenAI } from "openai";
import { executeFlow, hasFlowNodes } from "@/lib/flow-executor";

export async function processWebhookDirectly(webhook_payload: any): Promise<{ message: string; success?: boolean }> {
  let matcher;

  try {
    const messaging = webhook_payload.entry[0].messaging?.[0];
    
    // Check for postback event (button click)
    if (messaging?.postback?.payload) {
      console.log("Postback received:", messaging.postback.payload);
      matcher = await matchKeyword(
        messaging.postback.payload,
        "DM" // Postbacks come through messaging, treated as DM type for matching
      );
    }
    // Match keywords for DM
    else if (messaging?.message?.text) {
      matcher = await matchKeyword(
        messaging.message.text,
        "DM"
      );
    }

    // Match keywords for Comment
    if (!matcher && webhook_payload.entry[0].changes) {
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

        const automation = await getKeywordAutomation(matcher.automationId, true);
        if (!automation || !automation.active) {
          return { message: "Automation inactive" };
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
              return { message: "Post not attached to automation" };
            }
          }
        }

        // Detect if this is a story reply (message has replied_to property referencing a story)
        const messagePayload = webhook_payload.entry[0].messaging?.[0]?.message;
        const isStoryReply = !!(messagePayload?.reply_to?.story || messagePayload?.is_echo === false && messagePayload?.attachments?.[0]?.type === "story_mention");

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
          commentId: isComment ? webhook_payload.entry[0].changes[0].value.id : undefined,
          mediaId: isComment ? webhook_payload.entry[0].changes[0].value.media?.id : undefined,
          triggerType: (isStoryReply ? "STORY_REPLY" : isMessage ? "DM" : "COMMENT") as "DM" | "COMMENT" | "STORY_REPLY",
          isStoryReply,
          userSubscription: automation.User?.subscription?.plan,
          userOpenAiKey: automation.User?.openAiKey || undefined,
        };

        const flowResult = await executeFlow(matcher.automationId, context);
        console.log("Flow execution result:", flowResult);

        return { message: flowResult.message, success: flowResult.success };
      }

      // Legacy: basic message sending
      const automation = await getKeywordAutomation(matcher.automationId, true);
      if (automation && automation.active && automation.listener) {
        if (automation.listener.listener === "MESSAGE" && webhook_payload.entry[0].messaging) {
          const result = await sendDM(
            webhook_payload.entry[0].id,
            webhook_payload.entry[0].messaging[0].sender.id,
            automation.listener.prompt || "",
            automation.User?.integrations[0].token!
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
        webhook_payload.entry[0].messaging[0].sender.id
      );

      if (customer_history.history.length > 0 && customer_history.automationId) {
        const automation = await findAutomation(customer_history.automationId);

        if (
          automation?.User?.subscription?.plan === "PRO" &&
          automation.listener?.listener === "SMARTAI" &&
          automation.active
        ) {
          const openaiClient = automation.User?.openAiKey
            ? new OpenAI({ apiKey: automation.User.openAiKey })
            : openai;

          const smart_ai_message = await openaiClient.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "assistant", content: `${automation.listener?.prompt}: keep responses under 2 sentences` },
              ...customer_history.history,
              { role: "user", content: webhook_payload.entry[0].messaging[0].message.text },
            ],
          });

          if (smart_ai_message.choices[0].message.content) {
            const reciever = createChatHistory(
              automation.id,
              webhook_payload.entry[0].id,
              webhook_payload.entry[0].messaging[0].sender.id,
              webhook_payload.entry[0].messaging[0].message.text
            );

            const sender = createChatHistory(
              automation.id,
              webhook_payload.entry[0].id,
              webhook_payload.entry[0].messaging[0].sender.id,
              smart_ai_message.choices[0].message.content
            );

            await client.$transaction([reciever, sender]);

            const direct_message = await sendDM(
              webhook_payload.entry[0].id,
              webhook_payload.entry[0].messaging[0].sender.id,
              smart_ai_message.choices[0].message.content,
              automation.User?.integrations[0].token!
            );

            if (direct_message.status === 200) {
              await trackAnalytics(automation.userId!, "dm").catch(console.error);
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
