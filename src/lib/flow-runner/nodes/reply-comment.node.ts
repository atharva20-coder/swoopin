/**
 * ============================================
 * REPLY COMMENT NODE EXECUTOR
 * Replies to an Instagram comment.
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";

export class ReplyCommentNodeExecutor implements INodeExecutor {
  readonly type = "action";
  readonly subType = "REPLY_COMMENT";
  readonly description = "Reply to an Instagram comment";

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
      message: "Starting REPLY_COMMENT node execution",
    });

    const { token, commentId } = context;

    if (!commentId) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "No comment ID in context",
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
      message: "Sending comment reply",
      data: {
        commentId,
        replyPreview: replyText.substring(0, 50) + "...",
        usedAiResponse,
      },
    });

    try {
      // Use the robust instagram/comments library
      const { replyToComment } = await import("@/lib/instagram/comments");
      const result = await replyToComment(commentId, replyText, token);

      if (result.success) {
        logs.push({
          timestamp: Date.now(),
          level: "info",
          message: "Comment reply sent successfully",
          data: {
            replyId: result.data?.id,
            executionTimeMs: Date.now() - startTime,
          },
        });

        const outputItems: ItemData[] = items.map((item) => ({
          ...item,
          json: {
            ...item.json,
            replySent: replyText,
            replyId: result.data?.id,
            commentId,
          },
          meta: {
            sourceNodeId: "REPLY_COMMENT",
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
            ? "Comment reply sent with AI response"
            : "Comment reply sent",
          logs,
        };
      }

      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Failed to reply to comment",
        data: { error: result.error },
      });

      return {
        success: false,
        items: [],
        message: result.error || "Failed to reply to comment",
        logs,
      };
    } catch (error) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Exception sending comment reply",
        data: { error: error instanceof Error ? error.message : String(error) },
      });

      return {
        success: false,
        items: [],
        message: `Comment reply failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        logs,
      };
    }
  }
}

export const replyCommentNodeExecutor = new ReplyCommentNodeExecutor();
