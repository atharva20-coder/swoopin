/**
 * ============================================
 * KEYWORDS NODE EXECUTOR
 * Acts as a condition node that gates downstream execution
 * based on whether configured keywords match the message.
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";

export class KeywordsNodeExecutor implements INodeExecutor {
  readonly type = "trigger"; // Acts like a trigger/condition
  readonly subType = "KEYWORDS";
  readonly description = "Filter messages based on keyword matches";

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
      message: "Starting KEYWORDS node execution",
    });

    const messageText = context.messageText || "";
    const keywords = (config.keywords as string[]) || [];

    logs.push({
      timestamp: Date.now(),
      level: "debug",
      message: "Checking keywords",
      data: {
        messagePreview: messageText.substring(0, 50),
        keywordCount: keywords.length,
        keywords: keywords.slice(0, 5), // Show first 5
      },
    });

    if (!messageText || keywords.length === 0) {
      logs.push({
        timestamp: Date.now(),
        level: "warn",
        message: "No message text or no keywords configured",
      });

      // Return success but mark as not matched - this allows other branches to run
      return {
        success: true,
        items: items.map((item) => ({
          ...item,
          json: {
            ...item.json,
            keywordMatched: false,
            keywordMatchedWord: null,
          },
        })),
        message: "No keywords to match",
        logs,
      };
    }

    // Check if any keyword matches
    const messageLower = messageText.toLowerCase();
    let matchedKeyword: string | null = null;

    for (const keyword of keywords) {
      if (
        typeof keyword === "string" &&
        messageLower.includes(keyword.toLowerCase())
      ) {
        matchedKeyword = keyword;
        break;
      }
    }

    // Store match result in context for downstream nodes
    context.keywordMatched = !!matchedKeyword;
    context.keywordMatchedWord = matchedKeyword;

    if (matchedKeyword) {
      logs.push({
        timestamp: Date.now(),
        level: "info",
        message: "Keyword matched!",
        data: { matchedKeyword },
      });

      console.log(`[Keywords] Matched keyword: "${matchedKeyword}"`);

      return {
        success: true,
        items: items.map((item) => ({
          ...item,
          json: {
            ...item.json,
            keywordMatched: true,
            keywordMatchedWord: matchedKeyword,
          },
        })),
        message: `Keyword matched: ${matchedKeyword}`,
        logs,
      };
    } else {
      logs.push({
        timestamp: Date.now(),
        level: "info",
        message: "No keyword matched - branch ends (n8n style: empty output)",
      });

      console.log("[Keywords] No keyword matched, branch output is empty");

      // n8n-style: return success with EMPTY items
      // Empty output means children won't execute, but flow continues for other branches
      return {
        success: true,
        items: [], // Empty = this branch effectively stops
        message: "No keyword matched",
        logs,
      };
    }
  }
}

export const keywordsNodeExecutor = new KeywordsNodeExecutor();
