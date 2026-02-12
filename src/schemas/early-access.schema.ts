import { z } from "zod";

/**
 * ============================================
 * EARLY ACCESS REQUEST SCHEMAS
 * Contract-Driven Design for tester enrollment
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
// REQUEST SCHEMAS
// ============================================

export const EarlyAccessRequestSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
  email: z.string().email("A valid email is required"),
  instagramHandle: nullishToNull,
  note: nullishToNull,
});

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const EarlyAccessStatusSchema = z.enum([
  "PENDING",
  "CONTACTED",
  "ENROLLED",
  "REJECTED",
]);

export const EarlyAccessResponseSchema = z.object({
  id: z.string().uuid(),
  platform: z.string(),
  fullName: z.string(),
  email: z.string(),
  instagramHandle: z.string().nullable(),
  status: EarlyAccessStatusSchema,
  createdAt: z.coerce.date(),
});

// ============================================
// EXPORTED TYPES
// ============================================

export type EarlyAccessRequestInput = z.infer<typeof EarlyAccessRequestSchema>;
export type EarlyAccessStatus = z.infer<typeof EarlyAccessStatusSchema>;
export type EarlyAccessResponse = z.infer<typeof EarlyAccessResponseSchema>;
