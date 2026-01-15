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

export const CanvaDesignSchema = z.object({
  id: z.string(),
  title: z.string(),
  owner: z
    .object({
      display_name: z.string().optional(),
    })
    .optional(),
  thumbnail: z
    .object({
      url: z.string().url(),
    })
    .optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const CanvaDesignListSchema = z.array(CanvaDesignSchema);

export const CanvaDesignsResponseSchema = z.object({
  designs: CanvaDesignListSchema,
  continuation: nullishStringToNull,
});

// ============================================
// EXPORT SCHEMA
// ============================================

export const ExportFormatSchema = z.enum(["png", "jpg"]);

export const ExportStatusSchema = z.enum([
  "pending",
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
  limit: z.coerce.number().min(1).max(100).default(25).optional(),
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
