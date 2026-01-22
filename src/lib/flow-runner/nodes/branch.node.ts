/**
 * ============================================
 * BRANCH NODE EXECUTORS (YES/NO)
 * Simple pass-through nodes for condition branching.
 * These just pass data through to children without modification.
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";

/**
 * YES branch node - executes when condition is true
 * Simply passes data through to connected children
 */
export class YesNodeExecutor implements INodeExecutor {
  readonly type = "branch"; // Pass-through, not a condition evaluator
  readonly subType = "YES";
  readonly description = "Continue flow when condition is true";

  async execute(
    config: Record<string, unknown>,
    items: ItemData[],
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    const logs: ExecutionLogEntry[] = [
      {
        timestamp: Date.now(),
        level: "info",
        message: "YES branch - passing through",
      },
    ];

    return {
      success: true,
      items,
      message: "YES branch executed",
      logs,
    };
  }
}

/**
 * NO branch node - executes when condition is false
 * Simply passes data through to connected children
 */
export class NoNodeExecutor implements INodeExecutor {
  readonly type = "branch"; // Pass-through, not a condition evaluator
  readonly subType = "NO";
  readonly description = "Continue flow when condition is false";

  async execute(
    config: Record<string, unknown>,
    items: ItemData[],
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    const logs: ExecutionLogEntry[] = [
      {
        timestamp: Date.now(),
        level: "info",
        message: "NO branch - passing through",
      },
    ];

    return {
      success: true,
      items,
      message: "NO branch executed",
      logs,
    };
  }
}

export const yesNodeExecutor = new YesNodeExecutor();
export const noNodeExecutor = new NoNodeExecutor();
