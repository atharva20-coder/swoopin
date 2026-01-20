/**
 * ============================================
 * REPLY MENTION NODE EXECUTOR
 * Replies to Instagram story mentions.
 * @see https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/mentions
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";
import { z } from "zod";

// =============================================================================
// SCHEMA (Zero-Patchwork Protocol)
// =============================================================================

const ReplyMentionConfigSchema = z.object({
  message: z
    .string()
    .min(1)
    .max(1000)
    .nullish()
    .transform((v) => v ?? null),
});

// =============================================================================
// EXECUTOR
// =============================================================================

export class ReplyMentionNodeExecutor implements INodeExecutor {
  readonly type = "action";
  readonly subType = "REPLY_MENTION";
  readonly description = "Reply to Instagram story mention";

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
      message: "Starting REPLY_MENTION node execution",
    });

    const { token, pageId, mediaId, commentId } = context;

    if (!mediaId) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "No media ID in context",
      });

      return {
        success: false,
        items: [],
        message: "No media to reply to",
        logs,
      };
    }

    // Get reply text: prioritize AI response, then config
    const configValidation = ReplyMentionConfigSchema.safeParse(config);
    const configMessage = configValidation.success
      ? configValidation.data.message
      : null;
    const replyText = context.aiResponse || configMessage || "";

    if (!replyText) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "No reply text configured",
      });

      return {
        success: false,
        items: [],
        message: "No reply text configured",
        logs,
      };
    }

    const usedAiResponse = !!context.aiResponse;
    if (context.aiResponse) {
      delete context.aiResponse;
    }

    logs.push({
      timestamp: Date.now(),
      level: "info",
      message: "Sending mention reply",
      data: { mediaId, replyPreview: replyText.substring(0, 50) },
    });

    try {
      const { replyToMention } = await import("@/lib/instagram/mentions");
      const result = await replyToMention(
        pageId,
        mediaId,
        replyText,
        token,
        commentId,
      );

      if (result.success) {
        logs.push({
          timestamp: Date.now(),
          level: "info",
          message: "Mention reply sent successfully",
          data: { executionTimeMs: Date.now() - startTime },
        });

        const outputItems: ItemData[] = items.map((item) => ({
          ...item,
          json: {
            ...item.json,
            mentionReplySent: true,
            usedAiResponse,
            mediaId,
          },
        }));

        return {
          success: true,
          items:
            outputItems.length > 0
              ? outputItems
              : [{ json: { mentionReplySent: true } }],
          message: usedAiResponse
            ? "Mention reply sent with AI response"
            : "Mention reply sent",
          logs,
        };
      }

      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Failed to reply to mention",
        data: { error: result.error },
      });

      return {
        success: false,
        items: [],
        message: result.error || "Failed to reply to mention",
        logs,
      };
    } catch (error) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Exception replying to mention",
        data: { error: error instanceof Error ? error.message : String(error) },
      });

      return {
        success: false,
        items: [],
        message: `Mention reply failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        logs,
      };
    }
  }
}

export const replyMentionNodeExecutor = new ReplyMentionNodeExecutor();
