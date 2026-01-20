/**
 * ============================================
 * PERSISTENT MENU NODE EXECUTOR
 * Sets the persistent menu for the conversation.
 * @see https://developers.facebook.com/docs/messenger-platform/send-messages/persistent-menu
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";
import { setPersistentMenu } from "@/lib/fetch";
import { z } from "zod";

// =============================================================================
// SCHEMA (Zero-Patchwork Protocol)
// =============================================================================

const MenuItemSchema = z.object({
  type: z.enum(["web_url", "postback"]),
  title: z.string().min(1).max(30),
  url: z
    .string()
    .url()
    .nullish()
    .transform((v) => v ?? undefined),
  payload: z
    .string()
    .nullish()
    .transform((v) => v ?? undefined),
});

const PersistentMenuConfigSchema = z.object({
  menuItems: z.array(MenuItemSchema).min(1).max(3),
});

// =============================================================================
// EXECUTOR
// =============================================================================

export class PersistentMenuNodeExecutor implements INodeExecutor {
  readonly type = "action";
  readonly subType = "PERSISTENT_MENU";
  readonly description = "Set the persistent menu";

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
      message: "Starting PERSISTENT_MENU node execution",
    });

    const { token } = context;

    // Validate config
    const validation = PersistentMenuConfigSchema.safeParse(config);
    if (!validation.success) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Invalid persistent menu configuration",
        data: { errors: validation.error.errors },
      });

      return {
        success: false,
        items: [],
        message: "No menu items configured",
        logs,
      };
    }

    const { menuItems } = validation.data;

    logs.push({
      timestamp: Date.now(),
      level: "info",
      message: "Setting persistent menu",
      data: { itemCount: menuItems.length },
    });

    try {
      const result = await setPersistentMenu(
        menuItems.map((item) => ({
          type: item.type,
          title: item.title,
          url: item.url,
          payload: item.payload,
        })),
        token,
      );

      if (result.success) {
        logs.push({
          timestamp: Date.now(),
          level: "info",
          message: "Persistent menu set successfully",
          data: { executionTimeMs: Date.now() - startTime },
        });

        const outputItems: ItemData[] = items.map((item) => ({
          ...item,
          json: {
            ...item.json,
            persistentMenuSet: true,
            menuItemCount: menuItems.length,
          },
        }));

        return {
          success: true,
          items:
            outputItems.length > 0
              ? outputItems
              : [{ json: { persistentMenuSet: true } }],
          message: "Persistent menu set successfully",
          logs,
        };
      }

      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Failed to set persistent menu",
        data: { error: result.error },
      });

      return {
        success: false,
        items: [],
        message: result.error || "Failed to set persistent menu",
        logs,
      };
    } catch (error) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Exception setting persistent menu",
        data: { error: error instanceof Error ? error.message : String(error) },
      });

      return {
        success: false,
        items: [],
        message: `Persistent menu failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        logs,
      };
    }
  }
}

export const persistentMenuNodeExecutor = new PersistentMenuNodeExecutor();
