/**
 * ============================================
 * PRODUCT TEMPLATE NODE EXECUTOR
 * Sends products from Facebook catalog.
 * @see https://developers.facebook.com/docs/messenger-platform/send-messages/template/product
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";
import { sendProductTemplate } from "@/lib/fetch";
import { z } from "zod";

// =============================================================================
// SCHEMA (Zero-Patchwork Protocol)
// =============================================================================

const ProductTemplateConfigSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1).max(10),
});

// =============================================================================
// EXECUTOR
// =============================================================================

export class ProductTemplateNodeExecutor implements INodeExecutor {
  readonly type = "action";
  readonly subType = "PRODUCT_TEMPLATE";
  readonly description = "Send products from Facebook catalog";

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
      message: "Starting PRODUCT_TEMPLATE node execution",
    });

    const { token, pageId, senderId } = context;

    // Validate config
    const validation = ProductTemplateConfigSchema.safeParse(config);
    if (!validation.success) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Invalid product template configuration",
        data: { errors: validation.error.errors },
      });

      return {
        success: false,
        items: [],
        message: "No product IDs configured",
        logs,
      };
    }

    const { productIds } = validation.data;

    logs.push({
      timestamp: Date.now(),
      level: "info",
      message: "Sending product template",
      data: { productCount: productIds.length },
    });

    try {
      const result = await sendProductTemplate(
        pageId,
        senderId,
        productIds,
        token,
      );

      if (result.success) {
        logs.push({
          timestamp: Date.now(),
          level: "info",
          message: "Product template sent successfully",
          data: {
            messageId: result.messageId,
            executionTimeMs: Date.now() - startTime,
          },
        });

        const outputItems: ItemData[] = items.map((item) => ({
          ...item,
          json: {
            ...item.json,
            productTemplateSent: true,
            productIds,
          },
        }));

        return {
          success: true,
          items:
            outputItems.length > 0
              ? outputItems
              : [{ json: { productTemplateSent: true } }],
          message: "Product template sent",
          logs,
        };
      }

      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Failed to send product template",
        data: { error: result.error },
      });

      return {
        success: false,
        items: [],
        message: result.error || "Failed to send product template",
        logs,
      };
    } catch (error) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Exception sending product template",
        data: { error: error instanceof Error ? error.message : String(error) },
      });

      return {
        success: false,
        items: [],
        message: `Product template failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        logs,
      };
    }
  }
}

export const productTemplateNodeExecutor = new ProductTemplateNodeExecutor();
