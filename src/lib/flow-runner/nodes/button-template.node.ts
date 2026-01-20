/**
 * ============================================
 * BUTTON TEMPLATE NODE EXECUTOR
 * Sends text with up to 3 action buttons.
 * @see https://developers.facebook.com/docs/messenger-platform/send-messages/template/button
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";
import { sendButtonTemplate } from "@/lib/fetch";
import { z } from "zod";

// =============================================================================
// SCHEMA (Zero-Patchwork Protocol)
// =============================================================================

const ButtonSchema = z.object({
  type: z.enum(["web_url", "postback"]),
  title: z.string().min(1).max(20),
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

const ButtonTemplateConfigSchema = z.object({
  text: z
    .string()
    .min(1)
    .max(640)
    .nullish()
    .transform((v) => v ?? null),
  message: z
    .string()
    .min(1)
    .max(640)
    .nullish()
    .transform((v) => v ?? null),
  buttons: z.array(ButtonSchema).min(1).max(3),
});

// =============================================================================
// EXECUTOR
// =============================================================================

export class ButtonTemplateNodeExecutor implements INodeExecutor {
  readonly type = "action";
  readonly subType = "BUTTON_TEMPLATE";
  readonly description = "Send text with action buttons";

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
      message: "Starting BUTTON_TEMPLATE node execution",
    });

    const { token, pageId, senderId } = context;

    // Validate config
    const validation = ButtonTemplateConfigSchema.safeParse(config);
    if (!validation.success) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Invalid button template configuration",
        data: { errors: validation.error.errors },
      });

      return {
        success: false,
        items: [],
        message: "Invalid button template configuration",
        logs,
      };
    }

    const { text, message, buttons } = validation.data;
    const displayText = text || message;

    if (!displayText) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "No text configured for button template",
      });

      return {
        success: false,
        items: [],
        message: "No text configured for button template",
        logs,
      };
    }

    logs.push({
      timestamp: Date.now(),
      level: "info",
      message: "Sending button template",
      data: {
        buttonCount: buttons.length,
        textPreview: displayText.substring(0, 30),
      },
    });

    try {
      const result = await sendButtonTemplate(
        pageId,
        senderId,
        displayText,
        buttons.map((b) => ({
          type: b.type,
          title: b.title,
          url: b.url,
          payload: b.payload,
        })),
        token,
      );

      if (result.success) {
        logs.push({
          timestamp: Date.now(),
          level: "info",
          message: "Button template sent successfully",
          data: {
            messageId: result.messageId,
            executionTimeMs: Date.now() - startTime,
          },
        });

        const outputItems: ItemData[] = items.map((item) => ({
          ...item,
          json: {
            ...item.json,
            buttonTemplateSent: true,
            messageId: result.messageId,
          },
        }));

        return {
          success: true,
          items:
            outputItems.length > 0
              ? outputItems
              : [{ json: { buttonTemplateSent: true } }],
          message: "Button template sent",
          logs,
        };
      }

      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Failed to send button template",
        data: { error: result.error },
      });

      return {
        success: false,
        items: [],
        message: result.error || "Failed to send button template",
        logs,
      };
    } catch (error) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Exception sending button template",
        data: { error: error instanceof Error ? error.message : String(error) },
      });

      return {
        success: false,
        items: [],
        message: `Button template failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        logs,
      };
    }
  }
}

export const buttonTemplateNodeExecutor = new ButtonTemplateNodeExecutor();
