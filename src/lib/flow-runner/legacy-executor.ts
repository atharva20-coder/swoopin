/**
 * ============================================
 * LEGACY EXECUTOR BRIDGE
 * Wraps the old switch-based executor for backward compatibility.
 * This file will be deleted once all nodes are migrated.
 * ============================================
 */

import type { ExecutionContext as NewExecutionContext } from "./types";
import {
  sendDM,
  sendCarouselMessage,
  sendButtonTemplate,
  setIceBreakers,
  setPersistentMenu,
  sendSenderAction,
  sendProductTemplate,
  sendQuickReplies,
} from "@/lib/fetch";
import { client } from "@/lib/prisma";
import { webhookService } from "@/services/webhook.service";
import { analyticsService } from "@/services/analytics.service";

// Legacy types
type FlowNode = {
  nodeId: string;
  type: string;
  subType: string;
  label: string;
  config: Record<string, unknown>;
};

const trackResponses = webhookService.trackResponses.bind(webhookService);
const trackAnalytics = async (userId: string, type: "dm" | "comment") => {
  return analyticsService.trackEvent(userId, type);
};

/**
 * Legacy action node executor.
 * Contains nodes not yet migrated to the new architecture.
 */
export const executeActionNode = async (
  node: FlowNode,
  context: NewExecutionContext,
): Promise<{ success: boolean; message: string }> => {
  const { token, pageId, senderId, automationId, userId, commentId } = context;

  try {
    switch (node.subType) {
      // =================================================================
      // MIGRATED NODES - These should not be called via legacy executor
      // All 15 node types are now migrated to new architecture
      // =================================================================
      case "MESSAGE":
      case "SMARTAI":
      case "REPLY_COMMENT":
      case "DELAY":
      case "IS_FOLLOWER":
      case "CAROUSEL":
      case "BUTTON_TEMPLATE":
      case "PRODUCT_TEMPLATE":
      case "QUICK_REPLIES":
      case "ICE_BREAKERS":
      case "PERSISTENT_MENU":
      case "TYPING_ON":
      case "TYPING_OFF":
      case "MARK_SEEN":
      case "REPLY_MENTION":
      case "LOG_TO_SHEETS":
      case "HAS_TAG":
        console.warn(
          `[LegacyExecutor] Node ${node.subType} should use new executor!`,
        );
        return {
          success: false,
          message: `Use new executor for ${node.subType}`,
        };

      // =================================================================
      // NOT YET MIGRATED - Still using legacy execution
      // =================================================================

      case "CAROUSEL": {
        const automation = await client.automation.findUnique({
          where: { id: automationId },
          include: {
            listener: {
              include: {
                carouselTemplate: {
                  include: {
                    elements: {
                      include: { buttons: true },
                      orderBy: { order: "asc" },
                    },
                  },
                },
              },
            },
          },
        });

        const template = automation?.listener?.carouselTemplate;
        if (!template || template.elements.length === 0) {
          return { success: false, message: "No carousel template found" };
        }

        const carouselElements = template.elements.map(
          (element: {
            title: string;
            subtitle?: string | null;
            imageUrl?: string | null;
            defaultAction?: string | null;
            buttons: {
              type: string;
              title: string;
              url?: string | null;
              payload?: string | null;
            }[];
          }) => ({
            title: element.title,
            subtitle: element.subtitle || undefined,
            imageUrl: element.imageUrl || undefined,
            defaultAction: element.defaultAction || undefined,
            buttons: element.buttons.map(
              (button: {
                type: string;
                title: string;
                url?: string | null;
                payload?: string | null;
              }) => ({
                type: button.type.toLowerCase() as "web_url" | "postback",
                title: button.title,
                url: button.url || undefined,
                payload: button.payload || undefined,
              }),
            ),
          }),
        );

        const result = await sendCarouselMessage(
          pageId,
          senderId,
          carouselElements,
          token,
        );
        if (result) {
          await trackResponses(automationId, "CAROUSEL");
          await trackAnalytics(userId, "dm").catch(console.error);
          return { success: true, message: "Carousel sent" };
        }
        return { success: false, message: "Failed to send carousel" };
      }

      case "BUTTON_TEMPLATE": {
        const text =
          (node.config?.text as string) ||
          (node.config?.message as string) ||
          "";
        const buttons =
          (node.config?.buttons as {
            type: "web_url" | "postback";
            title: string;
            url?: string;
            payload?: string;
          }[]) || [];

        if (!text) {
          return {
            success: false,
            message: "No text configured for button template",
          };
        }
        if (buttons.length === 0) {
          return { success: false, message: "No buttons configured" };
        }

        const result = await sendButtonTemplate(
          pageId,
          senderId,
          text,
          buttons,
          token,
        );
        if (result.success) {
          await trackResponses(automationId, "DM");
          await trackAnalytics(userId, "dm").catch(console.error);
          return { success: true, message: "Button template sent" };
        }
        return {
          success: false,
          message: result.error || "Failed to send button template",
        };
      }

      case "PRODUCT_TEMPLATE": {
        const productIds = (node.config?.productIds as string[]) || [];
        if (productIds.length === 0) {
          return { success: false, message: "No product IDs configured" };
        }

        const result = await sendProductTemplate(
          pageId,
          senderId,
          productIds,
          token,
        );
        if (result.success) {
          await trackResponses(automationId, "DM");
          await trackAnalytics(userId, "dm").catch(console.error);
          return { success: true, message: "Product template sent" };
        }
        return {
          success: false,
          message: result.error || "Failed to send product template",
        };
      }

      case "QUICK_REPLIES": {
        const text = (node.config?.text as string) || "";
        const quickReplies =
          (node.config?.quickReplies as Array<{
            content_type: "text" | "user_phone_number";
            title?: string;
            payload?: string;
          }>) || [];

        if (!text) {
          return { success: false, message: "No message text configured" };
        }
        if (quickReplies.length === 0) {
          return { success: false, message: "No quick replies configured" };
        }

        const result = await sendQuickReplies(
          pageId,
          senderId,
          text,
          quickReplies,
          token,
        );
        if (result.success) {
          await trackResponses(automationId, "DM");
          await trackAnalytics(userId, "dm").catch(console.error);
          return { success: true, message: "Quick replies sent" };
        }
        return {
          success: false,
          message: result.error || "Failed to send quick replies",
        };
      }

      case "ICE_BREAKERS": {
        const iceBreakers =
          (node.config?.iceBreakers as {
            question: string;
            payload: string;
          }[]) || [];
        if (iceBreakers.length === 0) {
          return { success: false, message: "No ice breakers configured" };
        }

        const result = await setIceBreakers(iceBreakers, token);
        if (result.success) {
          return { success: true, message: "Ice breakers set successfully" };
        }
        return {
          success: false,
          message: result.error || "Failed to set ice breakers",
        };
      }

      case "PERSISTENT_MENU": {
        const menuItems =
          (node.config?.menuItems as {
            type: "web_url" | "postback";
            title: string;
            url?: string;
            payload?: string;
          }[]) || [];

        if (menuItems.length === 0) {
          return { success: false, message: "No menu items configured" };
        }

        const result = await setPersistentMenu(menuItems, token);
        if (result.success) {
          return { success: true, message: "Persistent menu set successfully" };
        }
        return {
          success: false,
          message: result.error || "Failed to set persistent menu",
        };
      }

      case "TYPING_ON": {
        const result = await sendSenderAction(
          pageId,
          senderId,
          "typing_on",
          token,
        );
        if (result.success) {
          return { success: true, message: "Typing indicator shown" };
        }
        return {
          success: false,
          message: result.error || "Failed to show typing indicator",
        };
      }

      case "TYPING_OFF": {
        const result = await sendSenderAction(
          pageId,
          senderId,
          "typing_off",
          token,
        );
        if (result.success) {
          return { success: true, message: "Typing indicator hidden" };
        }
        return {
          success: false,
          message: result.error || "Failed to hide typing indicator",
        };
      }

      case "MARK_SEEN": {
        const result = await sendSenderAction(
          pageId,
          senderId,
          "mark_seen",
          token,
        );
        if (result.success) {
          return { success: true, message: "Message marked as seen" };
        }
        return {
          success: false,
          message: result.error || "Failed to mark message as seen",
        };
      }

      case "REPLY_MENTION": {
        const mediaId = context.mediaId;
        if (!mediaId) {
          return { success: false, message: "No media to reply to" };
        }

        const replyText =
          context.aiResponse || (node.config?.message as string) || "";
        if (!replyText) {
          return { success: false, message: "No reply text configured" };
        }

        const usedAiResponse = !!context.aiResponse;
        if (context.aiResponse) {
          delete context.aiResponse;
        }

        const { replyToMention } = await import("@/lib/instagram/mentions");
        const result = await replyToMention(
          pageId,
          mediaId,
          replyText,
          token,
          commentId,
        );

        if (result.success) {
          await trackResponses(automationId, "MENTION");
          await trackAnalytics(userId, "comment").catch(console.error);
          return {
            success: true,
            message: usedAiResponse
              ? "Mention reply sent with AI response"
              : "Mention reply sent",
          };
        }
        return {
          success: false,
          message: result.error || "Failed to reply to mention",
        };
      }

      case "LOG_TO_SHEETS": {
        const sheetsConfig = node.config?.sheetsConfig as
          | {
              spreadsheetId?: string;
              sheetName?: string;
            }
          | undefined;

        if (!sheetsConfig?.spreadsheetId || !sheetsConfig?.sheetName) {
          return { success: false, message: "No sheets configuration" };
        }

        try {
          const { googleSheetsService } =
            await import("@/services/google-sheets.service");

          const timestamp = new Date().toISOString();
          const senderInfo = context.senderId || "Unknown";
          const messageContent =
            context.messageText || context.commentId || "N/A";
          const triggerType = context.triggerType;

          const result = await googleSheetsService.exportToSheet(
            context.userId,
            {
              spreadsheetId: sheetsConfig.spreadsheetId,
              sheetName: sheetsConfig.sheetName,
              columnHeaders: [
                "Timestamp",
                "Sender ID",
                "Message/Comment",
                "Trigger Type",
              ],
              rows: [[timestamp, senderInfo, messageContent, triggerType]],
            },
          );

          if ("exported" in result && result.exported) {
            return { success: true, message: "Data logged to sheets" };
          }
          return {
            success: false,
            message: "error" in result ? result.error : "Export failed",
          };
        } catch {
          return { success: false, message: "Failed to log to sheets" };
        }
      }

      // Passthrough nodes for condition branching
      case "YES":
      case "NO":
        return { success: true, message: "Branch node" };

      default:
        return {
          success: false,
          message: `Unknown action type: ${node.subType}`,
        };
    }
  } catch (error) {
    console.error(`[LegacyExecutor] Error executing ${node.subType}:`, error);
    return { success: false, message: `Execution error: ${error}` };
  }
};
