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
import { replyToMention, sendDM } from "@/lib/fetch"; // Updated import

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

    const { token, pageId, mediaId, commentId, isStoryMention, senderId } =
      context;

    // Validate context requirements
    if (isStoryMention) {
      if (!senderId) {
        logs.push({
          timestamp: Date.now(),
          level: "error",
          message: "No senderId context for Story Mention reply",
        });
        return {
          success: false,
          items: [],
          message: "No sender to reply to",
          logs,
        };
      }
    } else {
      // For standard mentions (posts/comments), we need mediaId or commentId
      if (!mediaId && !commentId) {
        logs.push({
          timestamp: Date.now(),
          level: "error",
          message: "No mediaId or commentId in context",
        });

        return {
          success: false,
          items: [],
          message: "No media or comment to reply to",
          logs,
        };
      }
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
      message: isStoryMention
        ? "Sending story mention reply (DM)"
        : "Sending mention reply",
      data: {
        mediaId,
        commentId,
        isStoryMention,
        replyPreview: replyText.substring(0, 50),
      },
    });

    try {
      let success = false;
      let replyId: string | undefined;
      let errorMsg: string | undefined;

      if (isStoryMention) {
        // Story mentions are in DMs, so we reply with a DM
        const dmResult = await sendDM(pageId, senderId, replyText, token);
        if (dmResult.status === 200) {
          success = true;
          replyId = dmResult.data?.message_id;
        } else {
          errorMsg = "Failed to send DM reply";
        }
      } else {
        // Post/Comment mentions use specific API
        const result = await replyToMention(
          pageId, // ig-user-id
          mediaId,
          commentId,
          replyText,
          token,
        );
        success = result.success;
        replyId = result.id;
        errorMsg = result.error;
      }

      if (success) {
        logs.push({
          timestamp: Date.now(),
          level: "info",
          message: "Mention reply sent successfully",
          data: { executionTimeMs: Date.now() - startTime, id: replyId },
        });

        const outputItems: ItemData[] = items.map((item) => ({
          ...item,
          json: {
            ...item.json,
            mentionReplySent: true,
            usedAiResponse,
            mediaId,
            commentId,
            replyId,
            isStoryMention,
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
        data: { error: errorMsg },
      });

      return {
        success: false,
        items: [],
        message: errorMsg || "Failed to reply to mention",
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
