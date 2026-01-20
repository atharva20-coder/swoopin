/**
 * ============================================
 * CAROUSEL NODE EXECUTOR
 * Sends a carousel (generic template) message.
 * @see https://developers.facebook.com/docs/messenger-platform/send-messages/template/generic
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";
import { sendCarouselMessage } from "@/lib/fetch";
import { client } from "@/lib/prisma";
import { z } from "zod";

// =============================================================================
// SCHEMA (Zero-Patchwork Protocol)
// =============================================================================

const CarouselElementSchema = z.object({
  title: z.string().min(1).max(80),
  subtitle: z
    .string()
    .max(80)
    .nullish()
    .transform((v) => v ?? undefined),
  imageUrl: z
    .string()
    .url()
    .nullish()
    .transform((v) => v ?? undefined),
  defaultAction: z
    .string()
    .url()
    .nullish()
    .transform((v) => v ?? undefined),
  buttons: z
    .array(
      z.object({
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
      }),
    )
    .max(3)
    .default([]),
});

const CarouselConfigSchema = z.object({
  elements: z.array(CarouselElementSchema).min(1).max(10).optional(),
});

// =============================================================================
// EXECUTOR
// =============================================================================

export class CarouselNodeExecutor implements INodeExecutor {
  readonly type = "action";
  readonly subType = "CAROUSEL";
  readonly description = "Send a carousel (generic template) message";

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
      message: "Starting CAROUSEL node execution",
    });

    const { token, pageId, senderId, automationId } = context;

    // Try to get elements from config first
    const configValidation = CarouselConfigSchema.safeParse(config);
    let elements = configValidation.success
      ? configValidation.data.elements
      : undefined;

    // If no elements in config, fetch from automation's carousel template
    if (!elements || elements.length === 0) {
      logs.push({
        timestamp: Date.now(),
        level: "debug",
        message: "No elements in config, fetching from automation template",
      });

      try {
        const automation = await client.automation.findUnique({
          where: { id: automationId },
          include: {
            listener: {
              include: {
                carouselTemplate: {
                  include: {
                    elements: {
                      include: { buttons: true },
                      orderBy: { order: "asc" },
                    },
                  },
                },
              },
            },
          },
        });

        const template = automation?.listener?.carouselTemplate;
        if (!template || template.elements.length === 0) {
          logs.push({
            timestamp: Date.now(),
            level: "error",
            message: "No carousel template found",
          });

          return {
            success: false,
            items: [],
            message: "No carousel template found",
            logs,
          };
        }

        elements = template.elements.map((element) => ({
          title: element.title,
          subtitle: element.subtitle ?? undefined,
          imageUrl: element.imageUrl ?? undefined,
          defaultAction: element.defaultAction ?? undefined,
          buttons: element.buttons.map((button) => ({
            type: button.type.toLowerCase() as "web_url" | "postback",
            title: button.title,
            url: button.url ?? undefined,
            payload: button.payload ?? undefined,
          })),
        }));
      } catch (error) {
        logs.push({
          timestamp: Date.now(),
          level: "error",
          message: "Failed to fetch carousel template",
          data: {
            error: error instanceof Error ? error.message : String(error),
          },
        });

        return {
          success: false,
          items: [],
          message: "Failed to fetch carousel template",
          logs,
        };
      }
    }

    logs.push({
      timestamp: Date.now(),
      level: "info",
      message: "Sending carousel",
      data: { elementCount: elements.length },
    });

    try {
      const result = await sendCarouselMessage(
        pageId,
        senderId,
        elements,
        token,
      );

      if (result) {
        logs.push({
          timestamp: Date.now(),
          level: "info",
          message: "Carousel sent successfully",
          data: { executionTimeMs: Date.now() - startTime },
        });

        const outputItems: ItemData[] = items.map((item) => ({
          ...item,
          json: {
            ...item.json,
            carouselSent: true,
            elementCount: elements!.length,
          },
        }));

        return {
          success: true,
          items:
            outputItems.length > 0
              ? outputItems
              : [{ json: { carouselSent: true } }],
          message: "Carousel sent",
          logs,
        };
      }

      return {
        success: false,
        items: [],
        message: "Failed to send carousel",
        logs,
      };
    } catch (error) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Exception sending carousel",
        data: { error: error instanceof Error ? error.message : String(error) },
      });

      return {
        success: false,
        items: [],
        message: `Carousel send failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        logs,
      };
    }
  }
}

export const carouselNodeExecutor = new CarouselNodeExecutor();
