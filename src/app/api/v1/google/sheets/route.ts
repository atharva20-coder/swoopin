import { NextRequest } from "next/server";
import { requireAuth } from "@/app/api/v1/_lib/middleware";
import { validateBody } from "@/app/api/v1/_lib/validation";
import { rateLimitByUser } from "@/app/api/v1/_lib/rate-limit";
import { success, error, validationError } from "@/app/api/v1/_lib/response";
import { googleSheetsService } from "@/services/google-sheets.service";
import {
  CreateSpreadsheetRequestSchema,
  GetTabsRequestSchema,
  ExportToSheetRequestSchema,
} from "@/schemas/google.schema";

/**
 * GET /api/v1/google/sheets
 * Get user's connection status and spreadsheets
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const rateLimitResponse = await rateLimitByUser(user.id, "standard");
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Check connection status
    if (action === "status") {
      const status = await googleSheetsService.getConnectionStatus(user.id);
      return success(status);
    }

    // Get spreadsheet tabs
    if (action === "tabs") {
      const validation = GetTabsRequestSchema.safeParse({
        spreadsheetId: searchParams.get("spreadsheetId"),
      });

      if (!validation.success) {
        return validationError("Invalid request parameters", {
          details: validation.error.errors,
        });
      }

      const tabs = await googleSheetsService.getSpreadsheetTabs(
        user.id,
        validation.data.spreadsheetId
      );

      if ("error" in tabs) {
        return error("EXTERNAL_API_ERROR", tabs.error, 400);
      }

      return success(tabs);
    }

    // Default: List spreadsheets
    const spreadsheets = await googleSheetsService.getSpreadsheets(user.id);

    if ("error" in spreadsheets) {
      return error("EXTERNAL_API_ERROR", spreadsheets.error, 400);
    }

    return success({ spreadsheets });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return error("UNAUTHORIZED", "Authentication required", 401);
    }
    console.error("Google Sheets GET error:", err);
    return error("INTERNAL_ERROR", "Failed to process request", 500);
  }
}

/**
 * POST /api/v1/google/sheets
 * Create spreadsheet or export data
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const rateLimitResponse = await rateLimitByUser(user.id, "standard");
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const action = body.action;

    // Create new spreadsheet
    if (action === "create") {
      const validation = CreateSpreadsheetRequestSchema.safeParse(body);
      if (!validation.success) {
        return validationError("Invalid request body", {
          details: validation.error.errors,
        });
      }

      const result = await googleSheetsService.createSpreadsheet(
        user.id,
        validation.data
      );

      if ("error" in result) {
        return error("EXTERNAL_API_ERROR", result.error, 400);
      }

      return success(result);
    }

    // Export data to sheet
    if (action === "export") {
      const validation = ExportToSheetRequestSchema.safeParse(body);
      if (!validation.success) {
        return validationError("Invalid request body", {
          details: validation.error.errors,
        });
      }

      const result = await googleSheetsService.exportToSheet(
        user.id,
        validation.data
      );

      if ("error" in result) {
        return error("EXTERNAL_API_ERROR", result.error, 400);
      }

      return success(result);
    }

    return error("INVALID_INPUT", "Unknown action specified", 400);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return error("UNAUTHORIZED", "Authentication required", 401);
    }
    console.error("Google Sheets POST error:", err);
    return error("INTERNAL_ERROR", "Failed to process request", 500);
  }
}

/**
 * DELETE /api/v1/google/sheets
 * Disconnect Google integration
 */
export async function DELETE() {
  try {
    const user = await requireAuth();

    const rateLimitResponse = await rateLimitByUser(user.id, "standard");
    if (rateLimitResponse) return rateLimitResponse;

    const result = await googleSheetsService.disconnect(user.id);
    return success(result);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return error("UNAUTHORIZED", "Authentication required", 401);
    }
    console.error("Google Sheets DELETE error:", err);
    return error("INTERNAL_ERROR", "Failed to disconnect", 500);
  }
}
