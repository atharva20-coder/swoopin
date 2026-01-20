/**
 * ============================================
 * CONDITION: IS FOLLOWER
 * Checks if the sender is following the page.
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";
import { checkIfFollower } from "@/lib/fetch";

export class IsFollowerNodeExecutor implements INodeExecutor {
  readonly type = "condition";
  readonly subType = "IS_FOLLOWER";
  readonly description = "Check if user is following the page";

  async execute(
    _config: Record<string, unknown>,
    items: ItemData[],
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    const logs: ExecutionLogEntry[] = [];
    const startTime = Date.now();

    const { token, pageId, senderId } = context;

    logs.push({
      timestamp: startTime,
      level: "info",
      message: "Checking if user is follower",
      data: { senderId },
    });

    try {
      const isFollower = await checkIfFollower(pageId, senderId, token);

      logs.push({
        timestamp: Date.now(),
        level: "info",
        message: `Follower check complete: ${isFollower}`,
        data: { isFollower, executionTimeMs: Date.now() - startTime },
      });

      // Add condition result to output items
      const outputItems: ItemData[] = items.map((item) => ({
        ...item,
        json: {
          ...item.json,
          conditionResult: isFollower,
          conditionType: "IS_FOLLOWER",
        },
      }));

      return {
        success: true,
        items:
          outputItems.length > 0
            ? outputItems
            : [{ json: { conditionResult: isFollower } }],
        message: isFollower ? "User is a follower" : "User is not a follower",
        logs,
      };
    } catch (error) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Follower check failed",
        data: { error: error instanceof Error ? error.message : String(error) },
      });

      // Default to false on error
      return {
        success: true, // Condition itself executed, just returned false
        items: [{ json: { conditionResult: false } }],
        message: "Follower check failed - defaulting to false",
        logs,
      };
    }
  }
}

export const isFollowerNodeExecutor = new IsFollowerNodeExecutor();
