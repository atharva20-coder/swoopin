import { z } from "zod";

/**
 * ============================================
 * CANVA SCHEMAS (Contract-Driven Design)
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

const nullishStringToUntitled = z
  .string()
  .nullish()
  .transform((val): string => val || "Untitled Design");

// ============================================
// CONNECTION STATUS SCHEMA
// ============================================

export const CanvaConnectionStatusSchema = z.object({
  connected: z.boolean(),
  canvaUserId: nullishStringToNull,
});

// ============================================
// DESIGN SCHEMA
// ============================================

// Raw response from Canva API (snake_case)
const CanvaDesignRawSchema = z.object({
  id: z.string(),
  title: z.string().optional().nullable(), // Allow missing title
  owner: z
    .object({
      display_name: z.string().optional(),
    })
    .optional(),
  thumbnail: z
    .object({
      url: z.string().url(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional()
    .nullable(),
  urls: z
    .object({
      view_url: z.string().optional(),
      edit_url: z.string().optional(),
    })
    .optional()
    .nullable(),
  created_at: z.number().optional(), // Canva often returns timestamps as numbers (epoch) or ISO strings
  updated_at: z.number().optional(),
});

// Transformed application-level schema (camelCase)
export const CanvaDesignSchema = CanvaDesignRawSchema.transform((raw) => ({
  id: raw.id,
  title: raw.title || "Untitled Design",
  thumbnail: raw.thumbnail
    ? {
        url: raw.thumbnail.url,
        width: raw.thumbnail.width ?? 0,
        height: raw.thumbnail.height ?? 0,
      }
    : null,
  urls: raw.urls
    ? {
        viewUrl: raw.urls.view_url || "",
        editUrl: raw.urls.edit_url || "",
      }
    : null,
  createdAt: raw.created_at
    ? new Date(raw.created_at).toISOString()
    : new Date().toISOString(),
  updatedAt: raw.updated_at
    ? new Date(raw.updated_at).toISOString()
    : new Date().toISOString(),
}));

export const CanvaDesignListSchema = z.array(CanvaDesignSchema);

// This matches the Service return type
export const CanvaDesignsResponseSchema = z.object({
  designs: CanvaDesignListSchema,
  continuation: nullishStringToNull,
});

// ============================================
// EXPORT SCHEMA
// ============================================

export const ExportFormatSchema = z.enum(["png", "jpg", "pdf"]);

export const ExportStatusSchema = z.enum([
  "pending",
  "in_progress",
  "processing",
  "completed",
  "failed",
]);

export const ExportResultSchema = z.object({
  exportId: z.string().optional(),
  status: ExportStatusSchema,
  urls: z.array(z.string().url()).optional(),
});

// ============================================
// REQUEST SCHEMAS
// ============================================

export const GetDesignsRequestSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  continuation: nullishStringToNull,
});

export const ExportDesignRequestSchema = z.object({
  designId: z.string().min(1, "Design ID is required"),
  format: ExportFormatSchema.default("png"),
});

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const ConnectUrlResponseSchema = z.object({
  url: z.string().url(),
});

export const ExportSuccessResponseSchema = z.object({
  urls: z.array(z.string().url()),
});

// ============================================
// EXPORTED TYPES
// ============================================

export type CanvaConnectionStatus = z.infer<typeof CanvaConnectionStatusSchema>;
export type CanvaDesign = z.infer<typeof CanvaDesignSchema>;
export type CanvaDesignsResponse = z.infer<typeof CanvaDesignsResponseSchema>;
export type ExportFormat = z.infer<typeof ExportFormatSchema>;
export type ExportResult = z.infer<typeof ExportResultSchema>;
export type GetDesignsRequest = z.infer<typeof GetDesignsRequestSchema>;
export type ExportDesignRequest = z.infer<typeof ExportDesignRequestSchema>;
