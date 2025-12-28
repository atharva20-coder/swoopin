"use server";

import { client } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  listSpreadsheets,
  createSpreadsheet,
  getSheetTabs,
  appendRows,
  ensureHeaders,
} from "@/lib/google/sheets";

/**
 * Check if user has Google connected
 */
export async function isGoogleConnected() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { connected: false };
    }

    const integration = await client.googleIntegration.findUnique({
      where: { userId: session.user.id },
    });

    return {
      connected: !!integration,
      email: integration?.email,
    };
  } catch (error) {
    console.error("Error checking Google connection:", error);
    return { connected: false };
  }
}

/**
 * Get user's spreadsheets
 */
export async function getUserSpreadsheets() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { status: 401, data: "Unauthorized" };
    }

    const result = await listSpreadsheets(session.user.id);
    if (!result.success) {
      return { status: 400, data: result.error };
    }

    return { status: 200, data: result.spreadsheets };
  } catch (error) {
    console.error("Error getting spreadsheets:", error);
    return { status: 500, data: "Failed to get spreadsheets" };
  }
}

/**
 * Create a new spreadsheet
 */
export async function createNewSpreadsheet(title: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { status: 401, data: "Unauthorized" };
    }

    const result = await createSpreadsheet(session.user.id, title);
    if (!result.success) {
      return { status: 400, data: result.error };
    }

    return { status: 200, data: { spreadsheetId: result.spreadsheetId } };
  } catch (error) {
    console.error("Error creating spreadsheet:", error);
    return { status: 500, data: "Failed to create spreadsheet" };
  }
}

/**
 * Get tabs in a spreadsheet
 */
export async function getSpreadsheetTabs(spreadsheetId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { status: 401, data: "Unauthorized" };
    }

    const result = await getSheetTabs(session.user.id, spreadsheetId);
    if (!result.success) {
      return { status: 400, data: result.error };
    }

    return { status: 200, data: result.tabs };
  } catch (error) {
    console.error("Error getting tabs:", error);
    return { status: 500, data: "Failed to get tabs" };
  }
}

/**
 * Export data to a sheet
 */
export async function exportToSheet(
  spreadsheetId: string,
  sheetName: string,
  columnHeaders: string[],
  rows: string[][]
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { status: 401, data: "Unauthorized" };
    }

    // Ensure headers exist
    await ensureHeaders(session.user.id, spreadsheetId, sheetName, columnHeaders);

    // Append data
    const result = await appendRows(session.user.id, spreadsheetId, sheetName, rows);
    if (!result.success) {
      return { status: 400, data: result.error };
    }

    return { status: 200, data: "Data exported successfully" };
  } catch (error) {
    console.error("Error exporting to sheet:", error);
    return { status: 500, data: "Failed to export data" };
  }
}

/**
 * Disconnect Google
 */
export async function disconnectGoogle() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { status: 401, data: "Unauthorized" };
    }

    await client.googleIntegration.delete({
      where: { userId: session.user.id },
    });

    return { status: 200, data: "Google disconnected" };
  } catch (error) {
    console.error("Error disconnecting Google:", error);
    return { status: 500, data: "Failed to disconnect" };
  }
}
