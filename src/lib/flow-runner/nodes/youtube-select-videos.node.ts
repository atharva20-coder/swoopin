/**
 * ============================================
 * YOUTUBE SELECT VIDEOS NODE EXECUTOR
 * Configuration node for selecting specific videos.
 * Currently acts as a pass-through.
 * Future: Could filter events based on video ID.
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
} from "../types";

export class YouTubeSelectVideosNodeExecutor implements INodeExecutor {
  readonly type = "trigger"; // Acts as trigger config/filter
  readonly subType = "YT_SELECT_VIDEOS";
  readonly description = "Filter by specific YouTube videos";

  async execute(
    _config: Record<string, unknown>,
    items: ItemData[],
    _context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    // Pass-through
    return {
      success: true,
      items,
      message: "Video selection processed",
      logs: [
        {
          timestamp: Date.now(),
          level: "info",
          message: "Video selection pass-through",
        },
      ],
    };
  }
}

export const youtubeSelectVideosNodeExecutor =
  new YouTubeSelectVideosNodeExecutor();
