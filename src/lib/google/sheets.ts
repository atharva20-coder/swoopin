"use server";

import { google, sheets_v4 } from "googleapis";
import { client } from "@/lib/prisma";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

/**
 * Get OAuth2 client for a user
 */
export async function getGoogleAuth(userId: string) {
  const integration = await client.googleIntegration.findUnique({
    where: { userId },
  });

  if (!integration) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`
  );

  oauth2Client.setCredentials({
    refresh_token: integration.refreshToken,
    access_token: integration.accessToken || undefined,
  });

  return oauth2Client;
}

/**
 * List user's spreadsheets
 */
export async function listSpreadsheets(userId: string): Promise<{
  success: boolean;
  spreadsheets?: Array<{ id: string; name: string }>;
  error?: string;
}> {
  try {
    const auth = await getGoogleAuth(userId);
    if (!auth) {
      return { success: false, error: "Google not connected" };
    }

    const drive = google.drive({ version: "v3", auth });
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: "files(id, name)",
      orderBy: "modifiedTime desc",
      pageSize: 50,
    });

    return {
      success: true,
      spreadsheets: (response.data.files || []).map((f) => ({
        id: f.id!,
        name: f.name!,
      })),
    };
  } catch (error) {
    console.error("Error listing spreadsheets:", error);
    return { success: false, error: "Failed to list spreadsheets" };
  }
}

/**
 * Create a new spreadsheet
 */
export async function createSpreadsheet(
  userId: string,
  title: string
): Promise<{ success: boolean; spreadsheetId?: string; error?: string }> {
  try {
    const auth = await getGoogleAuth(userId);
    if (!auth) {
      return { success: false, error: "Google not connected" };
    }

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
        sheets: [{ properties: { title: "Data" } }],
      },
    });

    return { success: true, spreadsheetId: response.data.spreadsheetId! };
  } catch (error) {
    console.error("Error creating spreadsheet:", error);
    return { success: false, error: "Failed to create spreadsheet" };
  }
}

/**
 * Get sheet tabs in a spreadsheet
 */
export async function getSheetTabs(
  userId: string,
  spreadsheetId: string
): Promise<{ success: boolean; tabs?: string[]; error?: string }> {
  try {
    const auth = await getGoogleAuth(userId);
    if (!auth) {
      return { success: false, error: "Google not connected" };
    }

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets.properties.title",
    });

    const tabs = response.data.sheets?.map((s) => s.properties?.title || "") || [];
    return { success: true, tabs };
  } catch (error) {
    console.error("Error getting sheet tabs:", error);
    return { success: false, error: "Failed to get sheet tabs" };
  }
}

/**
 * Append rows to a sheet
 */
export async function appendRows(
  userId: string,
  spreadsheetId: string,
  sheetName: string,
  rows: string[][]
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getGoogleAuth(userId);
    if (!auth) {
      return { success: false, error: "Google not connected" };
    }

    const sheets = google.sheets({ version: "v4", auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });

    return { success: true };
  } catch (error) {
    console.error("Error appending rows:", error);
    return { success: false, error: "Failed to append data" };
  }
}

/**
 * Set header row if empty
 */
export async function ensureHeaders(
  userId: string,
  spreadsheetId: string,
  sheetName: string,
  headers: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getGoogleAuth(userId);
    if (!auth) {
      return { success: false, error: "Google not connected" };
    }

    const sheets = google.sheets({ version: "v4", auth });
    
    // Check if first row exists
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1`,
    });

    if (!existing.data.values || existing.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [headers] },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error ensuring headers:", error);
    return { success: false, error: "Failed to set headers" };
  }
}
