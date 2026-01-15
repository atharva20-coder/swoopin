import { z } from "zod";
import { Prisma } from "@prisma/client";

/**
 * ============================================
 * DATA HUB SCHEMAS (Contract-Driven Design)
 * All normalization happens here via .transform()
 * Zero patchwork - schemas are the single source of truth
 * ============================================
 */

// ============================================
// TRANSFORMERS
// ============================================

/**
 * String normalizer: undefined/empty → null
 */
const nullishStringToNull = z
  .string()
  .nullish()
  .transform((val): string | null => val ?? null);

/**
 * JSON transformer for Prisma compatibility
 * Transforms Record to Prisma.InputJsonValue compatible format
 */
const jsonForPrisma = z
  .record(z.unknown())
  .optional()
  .transform((val): Prisma.InputJsonValue | undefined =>
    val ? (val as Prisma.InputJsonValue) : undefined
  );

/**
 * Nullable JSON transformer for Prisma
 */
const nullableJsonForPrisma = z
  .record(z.unknown())
  .nullish()
  .transform((val): Record<string, unknown> | null => val ?? null);

// ============================================
// ENUMS
// ============================================

export const CollectionSourceSchema = z.enum([
  "STORY_POLL",
  "STORY_QUESTION",
  "DM_KEYWORD",
  "COMMENT_KEYWORD",
  "BROADCAST_CHANNEL",
]);

export const CollectionStatusSchema = z.enum(["ACTIVE", "PAUSED", "COMPLETED"]);

// ============================================
// SHEETS CONFIG SCHEMA
// ============================================

export const SheetsConfigSchema = z.object({
  spreadsheetId: z.string(),
  spreadsheetName: z.string(),
  sheetName: z.string(),
});

/**
 * SheetsConfig transformer for Prisma JSON field
 */
export const SheetsConfigForPrismaSchema =
  SheetsConfigSchema.optional().transform(
    (val): Prisma.InputJsonValue | undefined =>
      val ? (val as Prisma.InputJsonValue) : undefined
  );

// ============================================
// COLLECTION SCHEMA
// ============================================

export const CollectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  source: CollectionSourceSchema,
  status: CollectionStatusSchema,
  sheetsConfig: SheetsConfigSchema.nullable(),
  triggerConfig: nullableJsonForPrisma,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  _count: z
    .object({
      responses: z.number().int(),
    })
    .optional(),
});

export const CollectionListSchema = z.array(CollectionSchema);

// ============================================
// RESPONSE SCHEMA
// ============================================

export const CollectionResponseSchema = z.object({
  id: z.string().uuid(),
  collectionId: z.string().uuid(),
  senderName: nullishStringToNull,
  senderId: nullishStringToNull,
  content: z.string(),
  metadata: nullableJsonForPrisma,
  exportedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});

export const CollectionResponseListSchema = z.array(CollectionResponseSchema);

// ============================================
// REQUEST SCHEMAS
// With Prisma-compatible transformations
// ============================================

export const CreateCollectionRequestSchema = z.object({
  name: z.string().min(1).max(200),
  source: CollectionSourceSchema,
  sheetsConfig: SheetsConfigForPrismaSchema,
  triggerConfig: jsonForPrisma,
});

export const UpdateCollectionStatusRequestSchema = z.object({
  status: CollectionStatusSchema,
});

/**
 * AddResponse with Prisma-compatible metadata transformation
 */
export const AddResponseRequestSchema = z.object({
  senderName: z
    .string()
    .optional()
    .transform((val): string | null => val ?? null),
  senderId: z
    .string()
    .optional()
    .transform((val): string | null => val ?? null),
  content: z.string().min(1),
  metadata: jsonForPrisma,
});

export const ResponsesQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
});

// ============================================
// EXPORTED TYPES
// ============================================

export type CollectionSource = z.infer<typeof CollectionSourceSchema>;
export type CollectionStatus = z.infer<typeof CollectionStatusSchema>;
export type SheetsConfig = z.infer<typeof SheetsConfigSchema>;
export type Collection = z.infer<typeof CollectionSchema>;
export type CollectionResponse = z.infer<typeof CollectionResponseSchema>;
export type CreateCollectionRequest = z.infer<
  typeof CreateCollectionRequestSchema
>;
export type UpdateCollectionStatusRequest = z.infer<
  typeof UpdateCollectionStatusRequestSchema
>;
export type AddResponseRequest = z.infer<typeof AddResponseRequestSchema>;
export type ResponsesQuery = z.infer<typeof ResponsesQuerySchema>;
