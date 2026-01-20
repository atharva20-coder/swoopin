/**
 * ============================================
 * LOG TO SHEETS NODE EXECUTOR
 * Exports flow data to Google Sheets.
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";
import { z } from "zod";

// =============================================================================
// SCHEMA (Zero-Patchwork Protocol)
// =============================================================================

const SheetsConfigSchema = z.object({
  spreadsheetId: z.string().min(1),
  sheetName: z.string().min(1),
});

const LogToSheetsConfigSchema = z.object({
  sheetsConfig: SheetsConfigSchema.nullish().transform((v) => v ?? null),
});

// =============================================================================
// EXECUTOR
// =============================================================================

export class LogToSheetsNodeExecutor implements INodeExecutor {
  readonly type = "action";
  readonly subType = "LOG_TO_SHEETS";
  readonly description = "Export data to Google Sheets";

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
      message: "Starting LOG_TO_SHEETS node execution",
    });

    const { userId, senderId, messageText, commentId, triggerType } = context;

    // Validate config
    const validation = LogToSheetsConfigSchema.safeParse(config);
    if (!validation.success || !validation.data.sheetsConfig) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Invalid sheets configuration",
        data: {
          errors: validation.success
            ? "No sheetsConfig"
            : validation.error.errors,
        },
      });

      return {
        success: false,
        items: [],
        message: "No sheets configuration",
        logs,
      };
    }

    const { spreadsheetId, sheetName } = validation.data.sheetsConfig;

    logs.push({
      timestamp: Date.now(),
      level: "info",
      message: "Exporting to Google Sheets",
      data: { spreadsheetId, sheetName },
    });

    try {
      const { googleSheetsService } =
        await import("@/services/google-sheets.service");

      const timestamp = new Date().toISOString();
      const senderInfo = senderId || "Unknown";
      const messageContent = messageText || commentId || "N/A";

      const result = await googleSheetsService.exportToSheet(userId, {
        spreadsheetId,
        sheetName,
        columnHeaders: [
          "Timestamp",
          "Sender ID",
          "Message/Comment",
          "Trigger Type",
        ],
        rows: [[timestamp, senderInfo, messageContent, triggerType]],
      });

      if ("exported" in result && result.exported) {
        logs.push({
          timestamp: Date.now(),
          level: "info",
          message: "Data logged to sheets successfully",
          data: { executionTimeMs: Date.now() - startTime },
        });

        const outputItems: ItemData[] = items.map((item) => ({
          ...item,
          json: {
            ...item.json,
            loggedToSheets: true,
            spreadsheetId,
            sheetName,
          },
        }));

        return {
          success: true,
          items:
            outputItems.length > 0
              ? outputItems
              : [{ json: { loggedToSheets: true } }],
          message: "Data logged to sheets",
          logs,
        };
      }

      const errorMessage = "error" in result ? result.error : "Export failed";
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Failed to log to sheets",
        data: { error: errorMessage },
      });

      return {
        success: false,
        items: [],
        message: errorMessage,
        logs,
      };
    } catch (error) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Exception logging to sheets",
        data: { error: error instanceof Error ? error.message : String(error) },
      });

      return {
        success: false,
        items: [],
        message: `Log to sheets failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        logs,
      };
    }
  }
}

export const logToSheetsNodeExecutor = new LogToSheetsNodeExecutor();
