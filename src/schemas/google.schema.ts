import { z } from "zod";
import { Prisma } from "@prisma/client";

/**
 * ============================================
 * GOOGLE SHEETS SCHEMAS (Contract-Driven Design)
 * All normalization happens here via .transform()
 * Zero patchwork - schemas are the single source of truth
 * ============================================
 */

// ============================================
// TRANSFORMERS
// ============================================

const nullishStringToNull = z
  .string()
  .nullish()
  .transform((val): string | null => val ?? null);

// ============================================
// SPREADSHEET SCHEMA
// ============================================

export const SpreadsheetSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdTime: z.string().optional(),
  modifiedTime: z.string().optional(),
});

export const SpreadsheetListSchema = z.array(SpreadsheetSchema);

// ============================================
// SHEET TAB SCHEMA
// ============================================

export const SheetTabSchema = z.object({
  sheetId: z.number(),
  title: z.string(),
  index: z.number(),
});

export const SheetTabListSchema = z.array(SheetTabSchema);

// ============================================
// CONNECTION STATUS SCHEMA
// ============================================

export const GoogleConnectionStatusSchema = z.object({
  connected: z.boolean(),
  email: nullishStringToNull,
});

// ============================================
// REQUEST SCHEMAS
// ============================================

export const CreateSpreadsheetRequestSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
});

export const GetTabsRequestSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
});

export const ExportToSheetRequestSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  sheetName: z.string().min(1, "Sheet name is required"),
  columnHeaders: z
    .array(z.string())
    .min(1, "At least one column header required"),
  rows: z.array(z.array(z.string())),
});

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const SpreadsheetCreatedResponseSchema = z.object({
  spreadsheetId: z.string(),
});

export const ExportSuccessResponseSchema = z.object({
  exported: z.boolean(),
  rowCount: z.number().int(),
});

// ============================================
// EXPORTED TYPES
// ============================================

export type Spreadsheet = z.infer<typeof SpreadsheetSchema>;
export type SheetTab = z.infer<typeof SheetTabSchema>;
export type GoogleConnectionStatus = z.infer<
  typeof GoogleConnectionStatusSchema
>;
export type CreateSpreadsheetRequest = z.infer<
  typeof CreateSpreadsheetRequestSchema
>;
export type GetTabsRequest = z.infer<typeof GetTabsRequestSchema>;
export type ExportToSheetRequest = z.infer<typeof ExportToSheetRequestSchema>;
export type SpreadsheetCreatedResponse = z.infer<
  typeof SpreadsheetCreatedResponseSchema
>;
export type ExportSuccessResponse = z.infer<typeof ExportSuccessResponseSchema>;
