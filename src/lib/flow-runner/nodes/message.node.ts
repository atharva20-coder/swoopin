/**
 * ============================================
 * MESSAGE NODE EXECUTOR
 * Sends a DM to the user via Instagram API.
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";
import { sendDM, sendSenderAction } from "@/lib/fetch";

export class MessageNodeExecutor implements INodeExecutor {
  readonly type = "action";
  readonly subType = "MESSAGE";
  readonly description = "Send a direct message to the user";

  async execute(
    config: Record<string, unknown>,
    items: ItemData[],
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    const logs: ExecutionLogEntry[] = [];
    const startTime = Date.now();

    logs.push({
      timestamp: startTime,
      level: "info",
      message: "Starting MESSAGE node execution",
      data: { configKeys: Object.keys(config) },
    });

    const { token, pageId, senderId } = context;

    // Get message text: prioritize AI response, then config, then input item
    let messageText = context.aiResponse || (config.message as string) || "";

    // If still no message, try to get from input items
    if (!messageText && items.length > 0 && items[0].json.message) {
      messageText = items[0].json.message as string;
    }

    if (!messageText) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "No message configured",
      });
      return {
        success: false,
        items: [],
        message: "No message configured",
        logs,
      };
    }

    const usedAiResponse = !!context.aiResponse;
    if (context.aiResponse) {
      delete context.aiResponse;
    }

    // Show typing indicator before sending
    try {
      await sendSenderAction(pageId, senderId, "mark_seen", token);
      await sendSenderAction(pageId, senderId, "typing_on", token);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      logs.push({
        timestamp: Date.now(),
        level: "debug",
        message: "Typing indicator shown",
      });
    } catch (e) {
      logs.push({
        timestamp: Date.now(),
        level: "warn",
        message: "Could not show typing indicator",
        data: { error: e instanceof Error ? e.message : String(e) },
      });
    }

    logs.push({
      timestamp: Date.now(),
      level: "info",
      message: "Sending DM",
      data: { messagePreview: messageText.substring(0, 50) + "..." },
    });

    try {
      const result = await sendDM(pageId, senderId, messageText, token);

      // Turn off typing indicator
      try {
        await sendSenderAction(pageId, senderId, "typing_off", token);
      } catch {
        // Ignore typing_off errors
      }

      if (result.status === 200) {
        logs.push({
          timestamp: Date.now(),
          level: "info",
          message: "DM sent successfully",
          data: {
            usedAiResponse,
            executionTimeMs: Date.now() - startTime,
          },
        });

        // Pass through input items with message data added
        const outputItems: ItemData[] = items.map((item) => ({
          ...item,
          json: {
            ...item.json,
            messageSent: messageText,
            messageId: result.data?.message_id,
          },
          meta: {
            sourceNodeId: "MESSAGE",
            timestamp: Date.now(),
          },
        }));

        return {
          success: true,
          items:
            outputItems.length > 0
              ? outputItems
              : [{ json: { messageSent: messageText } }],
          message: usedAiResponse ? "DM sent with AI response" : "DM sent",
          logs,
        };
      }

      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Failed to send DM",
        data: { status: result.status },
      });

      return {
        success: false,
        items: [],
        message: "Failed to send DM",
        logs,
      };
    } catch (error) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Exception sending DM",
        data: { error: error instanceof Error ? error.message : String(error) },
      });

      return {
        success: false,
        items: [],
        message: `DM send failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        logs,
      };
    }
  }
}

// Export singleton instance
export const messageNodeExecutor = new MessageNodeExecutor();
