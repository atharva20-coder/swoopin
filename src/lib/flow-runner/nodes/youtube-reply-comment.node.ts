/**
 * ============================================
 * YOUTUBE REPLY COMMENT NODE EXECUTOR
 * Replies to a YouTube comment.
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";
import axios from "axios";
import { youtubeService } from "@/services/youtube.service";

export class YouTubeReplyCommentNodeExecutor implements INodeExecutor {
  readonly type = "action";
  readonly subType = "YT_REPLY_COMMENT";
  readonly description = "Reply to a YouTube comment";

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
      message: "Starting YOUTUBE_REPLY_COMMENT node execution",
    });

    const { youtubeToken, youtubeCommentId } = context;

    if (!youtubeToken) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "No YouTube token in context",
      });

      return {
        success: false,
        items: [],
        message: "YouTube not connected",
        logs,
      };
    }

    if (!youtubeCommentId) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "No YouTube comment ID in context",
      });

      return {
        success: false,
        items: [],
        message: "No comment to reply to",
        logs,
      };
    }

    // Get reply text: prioritize AI response, then config
    const replyText =
      context.aiResponse || (config.commentReply as string) || "";

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
      message: "Sending YouTube comment reply",
      data: {
        youtubeCommentId,
        replyPreview: replyText.substring(0, 50) + "...",
        usedAiResponse,
      },
    });

    try {
      // Use YouTube Service for business logic (Zero-Patchwork Protocol)
      const { success, replyId, error } = await youtubeService.replyToComment(
        youtubeToken,
        youtubeCommentId,
        replyText,
      );

      if (!success) {
        throw new Error(error || "Unknown error in youtubeService");
      }

      logs.push({
        timestamp: Date.now(),
        level: "info",
        message: "YouTube comment reply sent successfully",
        data: {
          replyId,
          executionTimeMs: Date.now() - startTime,
        },
      });

      const outputItems: ItemData[] = items.map((item) => ({
        ...item,
        json: {
          ...item.json,
          replySent: replyText,
          replyId,
          youtubeCommentId,
        },
        meta: {
          sourceNodeId: "YOUTUBE_REPLY_COMMENT",
          timestamp: Date.now(),
        },
      }));

      return {
        success: true,
        items:
          outputItems.length > 0
            ? outputItems
            : [{ json: { replySent: replyText } }],
        message: usedAiResponse
          ? "YouTube comment reply sent with AI response"
          : "YouTube comment reply sent",
        logs,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Failed to reply to YouTube comment",
        data: { error: errorMessage },
      });

      return {
        success: false,
        items: [],
        message: `YouTube reply failed: ${errorMessage}`,
        logs,
      };
    }
  }
}

export const youtubeReplyCommentNodeExecutor =
  new YouTubeReplyCommentNodeExecutor();
