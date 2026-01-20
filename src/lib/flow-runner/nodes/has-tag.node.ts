/**
 * ============================================
 * HAS TAG CONDITION NODE
 * Checks if a comment or message contains specific hashtags.
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";
import { getMediaHashtags } from "@/lib/fetch";
import { z } from "zod";

// =============================================================================
// SCHEMA (Zero-Patchwork Protocol)
// =============================================================================

const HasTagConfigSchema = z.object({
  tags: z.array(z.string().min(1)).min(1),
  matchAll: z.boolean().default(false), // true = AND logic, false = OR logic
});

// =============================================================================
// EXECUTOR
// =============================================================================

export class HasTagNodeExecutor implements INodeExecutor {
  readonly type = "condition";
  readonly subType = "HAS_TAG";
  readonly description = "Check if content contains specific hashtags";

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
      message: "Starting HAS_TAG condition check",
    });

    const { token, mediaId, messageText } = context;

    // Validate config
    const validation = HasTagConfigSchema.safeParse(config);
    if (!validation.success) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Invalid tag configuration",
        data: { errors: validation.error.errors },
      });

      // Return false condition on invalid config
      return {
        success: true,
        items: [{ json: { conditionResult: false, conditionType: "HAS_TAG" } }],
        message: "Invalid tag configuration - defaulting to false",
        logs,
      };
    }

    const { tags, matchAll } = validation.data;
    const normalizedTags = tags.map((t) => t.toLowerCase().replace(/^#/, ""));

    logs.push({
      timestamp: Date.now(),
      level: "debug",
      message: "Checking for tags",
      data: { tags: normalizedTags, matchAll },
    });

    let foundTags: string[] = [];
    let hasTag = false;

    // Check message text for hashtags
    if (messageText) {
      const textTags = messageText.match(/#\w+/g) || [];
      const normalizedTextTags = textTags.map((t) =>
        t.toLowerCase().replace(/^#/, ""),
      );
      foundTags = normalizedTextTags;

      logs.push({
        timestamp: Date.now(),
        level: "debug",
        message: "Found tags in message",
        data: { foundTags },
      });
    }

    // Check media hashtags via API if mediaId available
    if (mediaId && foundTags.length === 0) {
      try {
        const mediaHashtags = await getMediaHashtags(mediaId, token);
        if (mediaHashtags && Array.isArray(mediaHashtags)) {
          foundTags = mediaHashtags.map((t: string) =>
            t.toLowerCase().replace(/^#/, ""),
          );

          logs.push({
            timestamp: Date.now(),
            level: "debug",
            message: "Found tags in media",
            data: { foundTags },
          });
        }
      } catch (error) {
        logs.push({
          timestamp: Date.now(),
          level: "warn",
          message: "Could not fetch media hashtags",
          data: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    }

    // Evaluate condition
    if (matchAll) {
      // All specified tags must be present
      hasTag = normalizedTags.every((tag) => foundTags.includes(tag));
    } else {
      // At least one specified tag must be present
      hasTag = normalizedTags.some((tag) => foundTags.includes(tag));
    }

    logs.push({
      timestamp: Date.now(),
      level: "info",
      message: `Tag check complete: ${hasTag}`,
      data: {
        hasTag,
        matchedTags: normalizedTags.filter((t) => foundTags.includes(t)),
        executionTimeMs: Date.now() - startTime,
      },
    });

    const outputItems: ItemData[] = items.map((item) => ({
      ...item,
      json: {
        ...item.json,
        conditionResult: hasTag,
        conditionType: "HAS_TAG",
        foundTags,
        matchedTags: normalizedTags.filter((t) => foundTags.includes(t)),
      },
    }));

    return {
      success: true,
      items:
        outputItems.length > 0
          ? outputItems
          : [{ json: { conditionResult: hasTag } }],
      message: hasTag ? "Tags found" : "Tags not found",
      logs,
    };
  }
}

export const hasTagNodeExecutor = new HasTagNodeExecutor();
