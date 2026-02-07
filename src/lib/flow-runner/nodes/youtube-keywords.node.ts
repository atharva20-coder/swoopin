/**
 * ============================================
 * YOUTUBE KEYWORDS NODE EXECUTOR
 * Checks if comment contains keywords.
 * Returns conditionResult: boolean.
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
} from "../types";

export class YouTubeKeywordsNodeExecutor implements INodeExecutor {
  readonly type = "condition"; // It's a condition node in the runner
  readonly subType = "YT_KEYWORDS";
  readonly description = "Check if comment matches keywords";

  async execute(
    config: Record<string, unknown>,
    items: ItemData[],
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    const messageText = String(
      context.messageText || items[0]?.json?.messageText || "",
    ).toLowerCase();
    const keywords = (config.keywords as string[]) || [];

    // Valid if ANY keyword matches (OR logic)
    // TODO: Support AND/OR config if added
    const match = keywords.some((kw: string) =>
      messageText.includes(kw.toLowerCase().trim()),
    );

    const outputItems = items.map((item) => ({
      ...item,
      json: {
        ...item.json,
        conditionResult: match,
        matchedKeywords: match
          ? keywords.filter((k) => messageText.includes(k.toLowerCase()))
          : [],
      },
    }));

    return {
      success: true, // Execution succeeded, result is in items
      items: outputItems,
      message: match ? "Keywords matched" : "No matching keywords",
      logs: [
        {
          timestamp: Date.now(),
          level: "info",
          message: match ? "Keywords matched" : "No match",
          data: {
            messageText,
            keywords,
            match,
          },
        },
      ],
    };
  }
}

export const youtubeKeywordsNodeExecutor = new YouTubeKeywordsNodeExecutor();
