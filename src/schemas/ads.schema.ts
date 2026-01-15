import { z } from "zod";
import { Prisma } from "@prisma/client";

/**
 * ============================================
 * ADS SCHEMAS (Contract-Driven Design)
 * All normalization happens here via .transform()
 * Zero patchwork - schemas are the single source of truth
 * ============================================
 */

// ============================================
// JSON TRANSFORMER (for Prisma JSON fields)
// ============================================

/**
 * Transforms any JSON-compatible value for Prisma
 * Handles undefined → null and ensures clean serialization
 */
const jsonTransformer = z
  .record(z.unknown())
  .nullish()
  .transform((val): Record<string, unknown> | null => val ?? null);

// ============================================
// ENUMS
// ============================================

export const CampaignStatusSchema = z.enum([
  "ACTIVE",
  "PAUSED",
  "DELETED",
  "ARCHIVED",
]);

export const CampaignObjectiveSchema = z.enum([
  "BRAND_AWARENESS",
  "REACH",
  "TRAFFIC",
  "ENGAGEMENT",
  "CONVERSIONS",
  "POST_ENGAGEMENT",
]);

// ============================================
// AD INSIGHTS SCHEMA (from Meta API)
// Single source of truth for insights data
// ============================================

export const AdInsightsSchema = z.object({
  impressions: z.number().int().min(0),
  reach: z.number().int().min(0),
  clicks: z.number().int().min(0),
  spend: z.string(),
  cpc: z.string(),
  cpm: z.string(),
  ctr: z.string(),
  actions: z
    .array(
      z.object({
        action_type: z.string(),
        value: z.string(),
      })
    )
    .optional()
    .transform(
      (val): Array<{ action_type: string; value: string }> | null => val ?? null
    ),
});

/**
 * Transform AdInsights to Prisma JSON-compatible format
 * This is the enterprise way - transformation in schema, not inline
 */
export const AdInsightsForPrismaSchema = AdInsightsSchema.transform(
  (val): Prisma.InputJsonValue => ({
    impressions: val.impressions,
    reach: val.reach,
    clicks: val.clicks,
    spend: val.spend,
    cpc: val.cpc,
    cpm: val.cpm,
    ctr: val.ctr,
    actions: val.actions,
  })
);

// ============================================
// CAMPAIGN SCHEMA
// ============================================

export const CampaignSchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string(),
  adAccountId: z.string(),
  name: z.string(),
  objective: CampaignObjectiveSchema,
  status: CampaignStatusSchema,
  budget: z.number().min(0),
  currency: z.string().default("USD"),
  startDate: z.coerce.date().nullable(),
  endDate: z.coerce.date().nullable(),
  insights: jsonTransformer,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CampaignListSchema = z.array(CampaignSchema);

// ============================================
// AD ACCOUNT SCHEMA
// ============================================

export const AdAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  account_id: z.string(),
  currency: z.string(),
  account_status: z.number(),
});

export const AdAccountListSchema = z.array(AdAccountSchema);

// ============================================
// REQUEST SCHEMAS
// ============================================

export const CreateCampaignRequestSchema = z.object({
  adAccountId: z.string().min(1, "Ad account ID is required"),
  name: z.string().min(1).max(200),
  objective: CampaignObjectiveSchema,
  budget: z.number().min(1),
  currency: z.string().default("USD"),
  startDate: z.coerce
    .date()
    .optional()
    .transform((val): Date | null => val ?? null),
  endDate: z.coerce
    .date()
    .optional()
    .transform((val): Date | null => val ?? null),
});

export const UpdateCampaignStatusRequestSchema = z.object({
  campaignId: z.string().uuid(),
  status: CampaignStatusSchema,
});

export const SyncCampaignsRequestSchema = z.object({
  adAccountId: z.string().min(1, "Ad account ID is required"),
});

// ============================================
// EXPORTED TYPES
// ============================================

export type CampaignStatus = z.infer<typeof CampaignStatusSchema>;
export type CampaignObjective = z.infer<typeof CampaignObjectiveSchema>;
export type Campaign = z.infer<typeof CampaignSchema>;
export type AdAccount = z.infer<typeof AdAccountSchema>;
export type AdInsights = z.infer<typeof AdInsightsSchema>;
export type CreateCampaignRequest = z.infer<typeof CreateCampaignRequestSchema>;
export type UpdateCampaignStatusRequest = z.infer<
  typeof UpdateCampaignStatusRequestSchema
>;
export type SyncCampaignsRequest = z.infer<typeof SyncCampaignsRequestSchema>;
