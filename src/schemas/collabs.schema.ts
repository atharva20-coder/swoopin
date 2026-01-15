import { z } from "zod";

/**
 * ============================================
 * COLLABS SCHEMAS (Contract-Driven Design)
 * All normalization happens here via .transform()
 * ============================================
 */

// ============================================
// TRANSFORMERS
// ============================================

const nullishToNull = z
  .string()
  .nullish()
  .transform((val): string | null => val ?? null);

// ============================================
// ENUMS
// ============================================

export const PartnershipStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
]);
export const PartnershipTypeSchema = z.enum([
  "BRAND_TO_CREATOR",
  "CREATOR_TO_BRAND",
]);

// ============================================
// PARTNERSHIP SCHEMA
// ============================================

export const PartnershipSchema = z.object({
  id: z.string().uuid(),
  partnerId: z.string(),
  partnerName: z.string(),
  partnerUsername: nullishToNull,
  status: PartnershipStatusSchema,
  type: PartnershipTypeSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const PartnershipListSchema = z.array(PartnershipSchema);

// ============================================
// REQUEST SCHEMAS
// ============================================

export const CreatePartnershipRequestSchema = z.object({
  partnerId: z.string().min(1, "Partner ID is required"),
  partnerName: z.string().min(1).max(200),
  partnerUsername: z
    .string()
    .optional()
    .transform((val): string | null => val ?? null),
  type: PartnershipTypeSchema,
});

// ============================================
// EXPORTED TYPES
// ============================================

export type PartnershipStatus = z.infer<typeof PartnershipStatusSchema>;
export type PartnershipType = z.infer<typeof PartnershipTypeSchema>;
export type Partnership = z.infer<typeof PartnershipSchema>;
export type CreatePartnershipRequest = z.infer<
  typeof CreatePartnershipRequestSchema
>;
