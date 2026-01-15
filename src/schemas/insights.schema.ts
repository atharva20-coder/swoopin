import { z } from "zod";

/**
 * ============================================
 * INSIGHTS SCHEMAS (Contract-Driven Design)
 * All normalization happens here via .transform()
 * ============================================
 */

// ============================================
// ACCOUNT INSIGHTS SCHEMA
// ============================================

export const AccountInsightsSchema = z.object({
  followers_count: z.number().int().min(0),
  follows_count: z.number().int().min(0),
  media_count: z.number().int().min(0),
  impressions: z.number().int().min(0).optional(),
  profile_views: z.number().int().min(0).optional(),
  reach: z.number().int().min(0).optional(),
  website_clicks: z.number().int().min(0).optional(),
});

// ============================================
// AUDIENCE INSIGHTS SCHEMA
// ============================================

export const AudienceInsightsSchema = z.object({
  age_ranges: z.record(z.number()).optional(),
  gender_distribution: z.record(z.number()).optional(),
  top_cities: z.record(z.number()).optional(),
  top_countries: z.record(z.number()).optional(),
});

// ============================================
// FOLLOWER GROWTH SCHEMA
// ============================================

export const FollowerGrowthPointSchema = z.object({
  date: z.string(),
  value: z.number().int(),
});

export const FollowerGrowthSchema = z.array(FollowerGrowthPointSchema);

// ============================================
// INSTAGRAM INSIGHTS DATA SCHEMA
// ============================================

export const InstagramInsightsDataSchema = z.object({
  account: AccountInsightsSchema.nullable(),
  audience: AudienceInsightsSchema.nullable(),
  followerGrowth: FollowerGrowthSchema,
  cachedAt: z.coerce.date().nullable(),
});

// ============================================
// EXPORTED TYPES
// ============================================

export type AccountInsights = z.infer<typeof AccountInsightsSchema>;
export type AudienceInsights = z.infer<typeof AudienceInsightsSchema>;
export type FollowerGrowthPoint = z.infer<typeof FollowerGrowthPointSchema>;
export type InstagramInsightsData = z.infer<typeof InstagramInsightsDataSchema>;
