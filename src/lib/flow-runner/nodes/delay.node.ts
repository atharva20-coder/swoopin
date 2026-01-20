/**
 * ============================================
 * DELAY NODE EXECUTOR
 * Pauses execution for a specified duration.
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";

export class DelayNodeExecutor implements INodeExecutor {
  readonly type = "action";
  readonly subType = "DELAY";
  readonly description = "Pause execution for a specified duration";

  async execute(
    config: Record<string, unknown>,
    items: ItemData[],
    _context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    const logs: ExecutionLogEntry[] = [];
    const startTime = Date.now();

    const delaySeconds =
      (config.delay as number) || (config.seconds as number) || 0;
    const delayMs = delaySeconds * 1000;

    logs.push({
      timestamp: startTime,
      level: "info",
      message: `Starting DELAY node: ${delaySeconds} seconds`,
    });

    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      logs.push({
        timestamp: Date.now(),
        level: "info",
        message: `Delay completed: ${delaySeconds} seconds`,
        data: { actualDelayMs: Date.now() - startTime },
      });
    }

    // Pass through items unchanged
    return {
      success: true,
      items: items.length > 0 ? items : [{ json: {} }],
      message:
        delayMs > 0 ? `Delayed ${delaySeconds} seconds` : "No delay configured",
      logs,
    };
  }
}

export const delayNodeExecutor = new DelayNodeExecutor();
