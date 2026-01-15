import { client } from "@/lib/prisma";
import {
  listSpreadsheets,
  createSpreadsheet,
  getSheetTabs,
  appendRows,
  ensureHeaders,
} from "@/lib/google/sheets";
import {
  SpreadsheetListSchema,
  SheetTabListSchema,
  GoogleConnectionStatusSchema,
  SpreadsheetCreatedResponseSchema,
  type Spreadsheet,
  type SheetTab,
  type GoogleConnectionStatus,
  type CreateSpreadsheetRequest,
  type ExportToSheetRequest,
} from "@/schemas/google.schema";

/**
 * ============================================
 * GOOGLE SHEETS SERVICE
 * Business logic for Google Sheets integration
 * IDOR protection via userId ownership checks
 * Zero patchwork - all transformations via Zod schemas
 * ============================================
 */

class GoogleSheetsService {
  /**
   * Check if user has Google connected
   * IDOR: Only returns connection for authenticated user
   */
  async getConnectionStatus(userId: string): Promise<GoogleConnectionStatus> {
    const integration = await client.googleIntegration.findUnique({
      where: { userId },
    });

    const result = GoogleConnectionStatusSchema.safeParse({
      connected: !!integration,
      email: integration?.email,
    });

    return result.success ? result.data : { connected: false, email: null };
  }

  /**
   * Get user's spreadsheets from Google Drive
   * IDOR: Only returns spreadsheets accessible by user's token
   */
  async getSpreadsheets(
    userId: string
  ): Promise<Spreadsheet[] | { error: string }> {
    const result = await listSpreadsheets(userId);

    if (!result.success) {
      return { error: result.error || "Failed to fetch spreadsheets" };
    }

    const validated = SpreadsheetListSchema.safeParse(result.spreadsheets);
    return validated.success ? validated.data : [];
  }

  /**
   * Create a new spreadsheet
   */
  async createSpreadsheet(
    userId: string,
    input: CreateSpreadsheetRequest
  ): Promise<{ spreadsheetId: string } | { error: string }> {
    const result = await createSpreadsheet(userId, input.title);

    if (!result.success || !result.spreadsheetId) {
      return { error: result.error || "Failed to create spreadsheet" };
    }

    const validated = SpreadsheetCreatedResponseSchema.safeParse({
      spreadsheetId: result.spreadsheetId,
    });

    return validated.success ? validated.data : { error: "Validation failed" };
  }

  /**
   * Get tabs in a spreadsheet
   */
  async getSpreadsheetTabs(
    userId: string,
    spreadsheetId: string
  ): Promise<SheetTab[] | { error: string }> {
    const result = await getSheetTabs(userId, spreadsheetId);

    if (!result.success) {
      return { error: result.error || "Failed to fetch tabs" };
    }

    const validated = SheetTabListSchema.safeParse(result.tabs);
    return validated.success ? validated.data : [];
  }

  /**
   * Export data to a Google Sheet
   */
  async exportToSheet(
    userId: string,
    input: ExportToSheetRequest
  ): Promise<{ exported: boolean; rowCount: number } | { error: string }> {
    // Ensure headers exist
    await ensureHeaders(
      userId,
      input.spreadsheetId,
      input.sheetName,
      input.columnHeaders
    );

    // Append data rows
    const result = await appendRows(
      userId,
      input.spreadsheetId,
      input.sheetName,
      input.rows
    );

    if (!result.success) {
      return { error: result.error || "Failed to export data" };
    }

    return {
      exported: true,
      rowCount: input.rows.length,
    };
  }

  /**
   * Disconnect Google integration
   * IDOR: Only disconnects for authenticated user
   */
  async disconnect(userId: string): Promise<{ disconnected: boolean }> {
    try {
      await client.googleIntegration.delete({
        where: { userId },
      });
      return { disconnected: true };
    } catch {
      // Already disconnected or doesn't exist
      return { disconnected: true };
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
