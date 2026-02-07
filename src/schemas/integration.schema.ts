import { z } from "zod";

/**
 * ============================================
 * INTEGRATION SCHEMAS (Contract-Driven Design)
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

export const IntegrationTypeSchema = z.enum([
  "INSTAGRAM",
  "LINKEDIN",
  "YOUTUBE",
  "FACEBOOK",
  "TWITTER",
]);

// ============================================
// INTEGRATION SCHEMA
// ============================================

export const IntegrationSchema = z.object({
  id: z.string().uuid(),
  name: IntegrationTypeSchema,
  instagramId: nullishToNull,
  expiresAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});

export const IntegrationListSchema = z.array(IntegrationSchema);

// ============================================
// REQUEST SCHEMAS
// ============================================

export const ConnectInstagramRequestSchema = z.object({
  code: z.string().min(1, "OAuth code is required"),
});

export const ConnectYouTubeRequestSchema = z.object({
  code: z.string().min(1, "OAuth code is required"),
});

export const DisconnectRequestSchema = z.object({
  integrationId: z.string().uuid(),
});

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const IntegrationConnectedSchema = z.object({
  id: z.string().uuid(),
  platform: IntegrationTypeSchema,
  instagramId: nullishToNull,
  expiresAt: z.coerce.date().nullable(),
});

export const OAuthUrlSchema = z.object({
  url: z.string().url(),
  platform: IntegrationTypeSchema,
});

// ============================================
// EXPORTED TYPES
// ============================================

export type IntegrationType = z.infer<typeof IntegrationTypeSchema>;
export type Integration = z.infer<typeof IntegrationSchema>;
export type ConnectInstagramRequest = z.infer<
  typeof ConnectInstagramRequestSchema
>;
export type DisconnectRequest = z.infer<typeof DisconnectRequestSchema>;
export type IntegrationConnected = z.infer<typeof IntegrationConnectedSchema>;
export type OAuthUrl = z.infer<typeof OAuthUrlSchema>;
