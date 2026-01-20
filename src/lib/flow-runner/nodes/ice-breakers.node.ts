/**
 * ============================================
 * ICE BREAKERS NODE EXECUTOR
 * Sets conversation ice breakers (suggested prompts).
 * @see https://developers.facebook.com/docs/messenger-platform/instagram/features/ice-breakers
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";
import { setIceBreakers } from "@/lib/fetch";
import { z } from "zod";

// =============================================================================
// SCHEMA (Zero-Patchwork Protocol)
// =============================================================================

const IceBreakerSchema = z.object({
  question: z.string().min(1).max(80),
  payload: z.string().min(1).max(1000),
});

const IceBreakersConfigSchema = z.object({
  iceBreakers: z.array(IceBreakerSchema).min(1).max(4),
});

// =============================================================================
// EXECUTOR
// =============================================================================

export class IceBreakersNodeExecutor implements INodeExecutor {
  readonly type = "action";
  readonly subType = "ICE_BREAKERS";
  readonly description = "Set conversation ice breakers";

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
      message: "Starting ICE_BREAKERS node execution",
    });

    const { token } = context;

    // Validate config
    const validation = IceBreakersConfigSchema.safeParse(config);
    if (!validation.success) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Invalid ice breakers configuration",
        data: { errors: validation.error.errors },
      });

      return {
        success: false,
        items: [],
        message: "No ice breakers configured",
        logs,
      };
    }

    const { iceBreakers } = validation.data;

    logs.push({
      timestamp: Date.now(),
      level: "info",
      message: "Setting ice breakers",
      data: { count: iceBreakers.length },
    });

    try {
      const result = await setIceBreakers(iceBreakers, token);

      if (result.success) {
        logs.push({
          timestamp: Date.now(),
          level: "info",
          message: "Ice breakers set successfully",
          data: { executionTimeMs: Date.now() - startTime },
        });

        const outputItems: ItemData[] = items.map((item) => ({
          ...item,
          json: {
            ...item.json,
            iceBreakersSet: true,
            iceBreakersCount: iceBreakers.length,
          },
        }));

        return {
          success: true,
          items:
            outputItems.length > 0
              ? outputItems
              : [{ json: { iceBreakersSet: true } }],
          message: "Ice breakers set successfully",
          logs,
        };
      }

      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Failed to set ice breakers",
        data: { error: result.error },
      });

      return {
        success: false,
        items: [],
        message: result.error || "Failed to set ice breakers",
        logs,
      };
    } catch (error) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Exception setting ice breakers",
        data: { error: error instanceof Error ? error.message : String(error) },
      });

      return {
        success: false,
        items: [],
        message: `Ice breakers failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        logs,
      };
    }
  }
}

export const iceBreakersNodeExecutor = new IceBreakersNodeExecutor();
