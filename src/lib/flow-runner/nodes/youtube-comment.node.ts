/**
 * ============================================
 * YOUTUBE COMMENT NODE EXECUTOR
 * Trigger node for new comments.
 * Logic is handled by the runner finding this node.
 * This executor exists for registry completeness.
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
} from "../types";

export class YouTubeCommentNodeExecutor implements INodeExecutor {
  readonly type = "trigger";
  readonly subType = "YT_COMMENT";
  readonly description = "Trigger on new YouTube comment";

  async execute(
    _config: Record<string, unknown>,
    items: ItemData[],
    _context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    // Triggers just pass through items to children
    return {
      success: true,
      items,
      message: "YouTube Comment trigger processed",
      logs: [
        {
          timestamp: Date.now(),
          level: "info",
          message: "Trigger processed",
        },
      ],
    };
  }
}

export const youtubeCommentNodeExecutor = new YouTubeCommentNodeExecutor();
