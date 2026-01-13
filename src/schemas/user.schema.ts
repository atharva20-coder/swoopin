import { z } from 'zod';

/**
 * ============================================
 * USER SCHEMAS (Contract-Driven Design)
 * All normalization happens here via .transform()
 * ============================================
 */

// ============================================
// TRANSFORMERS (Reusable normalizations)
// ============================================

/**
 * Transform nullish string to null (no undefined in DB)
 */
const nullishToNull = z.string().nullish().transform((val): string | null => val ?? null);

/**
 * Transform empty string to null
 */
const emptyToNull = z.string()
  .nullish()
  .transform((val): string | null => {
    if (val === undefined || val === null || val.trim() === '') {
      return null;
    }
    return val;
  });

// ============================================
// USER PROFILE RESPONSE SCHEMA
// ============================================

export const UserSubscriptionSchema = z.object({
  plan: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const UserIntegrationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  instagramId: nullishToNull,
  expiresAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});

export const UserStatsSchema = z.object({
  automationsCount: z.number().int().min(0),
  unreadNotifications: z.number().int().min(0),
});

export const UserProfileResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: nullishToNull,
  createdAt: z.coerce.date(),
  subscription: UserSubscriptionSchema.nullable(),
  integrations: z.array(UserIntegrationSchema),
  stats: UserStatsSchema,
  isAdmin: z.boolean(),
});

// ============================================
// UPDATE USER REQUEST SCHEMA
// ============================================

export const UpdateUserRequestSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .optional()
    .transform((val): string | undefined => {
      // Don't transform - let service handle
      return val;
    }),
});

// ============================================
// UPDATE USER RESPONSE SCHEMA
// ============================================

export const UpdateUserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: nullishToNull,
  updatedAt: z.coerce.date(),
});

// ============================================
// PRISMA INPUT SCHEMAS (For database layer)
// These ensure no undefined leaks into Prisma
// ============================================

export const UserUpdatePrismaInputSchema = z.object({
  name: emptyToNull.optional(),
}).transform((data) => {
  // Only include defined fields - no undefined in Prisma
  const result: { name?: string | null } = {};
  if (data.name !== undefined) {
    result.name = data.name;
  }
  return result;
});

// ============================================
// EXPORTED TYPES (Inferred from Zod)
// ============================================

export type UserSubscription = z.infer<typeof UserSubscriptionSchema>;
export type UserIntegration = z.infer<typeof UserIntegrationSchema>;
export type UserStats = z.infer<typeof UserStatsSchema>;
export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;
export type UserUpdatePrismaInput = z.infer<typeof UserUpdatePrismaInputSchema>;
