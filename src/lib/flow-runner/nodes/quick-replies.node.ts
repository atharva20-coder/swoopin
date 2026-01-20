/**
 * ============================================
 * QUICK REPLIES NODE EXECUTOR
 * Sends a message with quick reply buttons.
 * @see https://developers.facebook.com/docs/messenger-platform/send-messages/quick-replies
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";
import { sendQuickReplies } from "@/lib/fetch";
import { z } from "zod";

// =============================================================================
// SCHEMA (Zero-Patchwork Protocol)
// =============================================================================

const QuickReplySchema = z.object({
  content_type: z.enum(["text", "user_phone_number"]),
  title: z
    .string()
    .max(20)
    .nullish()
    .transform((v) => v ?? undefined),
  payload: z
    .string()
    .max(1000)
    .nullish()
    .transform((v) => v ?? undefined),
  image_url: z
    .string()
    .url()
    .nullish()
    .transform((v) => v ?? undefined),
});

const QuickRepliesConfigSchema = z.object({
  text: z.string().min(1).max(2000),
  quickReplies: z.array(QuickReplySchema).min(1).max(13),
});

// =============================================================================
// EXECUTOR
// =============================================================================

export class QuickRepliesNodeExecutor implements INodeExecutor {
  readonly type = "action";
  readonly subType = "QUICK_REPLIES";
  readonly description = "Send a message with quick reply buttons";

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
      message: "Starting QUICK_REPLIES node execution",
    });

    const { token, pageId, senderId } = context;

    // Validate config
    const validation = QuickRepliesConfigSchema.safeParse(config);
    if (!validation.success) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Invalid quick replies configuration",
        data: { errors: validation.error.errors },
      });

      return {
        success: false,
        items: [],
        message: "Invalid quick replies configuration",
        logs,
      };
    }

    const { text, quickReplies } = validation.data;

    logs.push({
      timestamp: Date.now(),
      level: "info",
      message: "Sending quick replies",
      data: {
        replyCount: quickReplies.length,
        textPreview: text.substring(0, 30),
      },
    });

    try {
      const result = await sendQuickReplies(
        pageId,
        senderId,
        text,
        quickReplies.map((qr) => ({
          content_type: qr.content_type,
          title: qr.title,
          payload: qr.payload,
        })),
        token,
      );

      if (result.success) {
        logs.push({
          timestamp: Date.now(),
          level: "info",
          message: "Quick replies sent successfully",
          data: {
            messageId: result.messageId,
            executionTimeMs: Date.now() - startTime,
          },
        });

        const outputItems: ItemData[] = items.map((item) => ({
          ...item,
          json: {
            ...item.json,
            quickRepliesSent: true,
            messageId: result.messageId,
          },
        }));

        return {
          success: true,
          items:
            outputItems.length > 0
              ? outputItems
              : [{ json: { quickRepliesSent: true } }],
          message: "Quick replies sent",
          logs,
        };
      }

      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Failed to send quick replies",
        data: { error: result.error },
      });

      return {
        success: false,
        items: [],
        message: result.error || "Failed to send quick replies",
        logs,
      };
    } catch (error) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Exception sending quick replies",
        data: { error: error instanceof Error ? error.message : String(error) },
      });

      return {
        success: false,
        items: [],
        message: `Quick replies failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        logs,
      };
    }
  }
}

export const quickRepliesNodeExecutor = new QuickRepliesNodeExecutor();
