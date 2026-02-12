import { z } from "zod";

/**
 * ============================================
 * TELEMETRY SCHEMAS (Zero-Patchwork Protocol)
 * All optional fields use .nullish().transform()
 * to normalize undefined → null at the gateway
 * ============================================
 */

// ============================================
// AUTOMATION HEALTH SCHEMA
// Per-automation metrics with hit counts
// ============================================

export const AutomationHealthSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  active: z.boolean(),
  dmHits: z.number().int().min(0),
  commentHits: z.number().int().min(0),
  totalHits: z.number().int().min(0),
  postCount: z.number().int().min(0),
  keywordCount: z.number().int().min(0),
  keywords: z.array(z.string()),
  createdAt: z.coerce.date(),
});

// ============================================
// TOP POST SCHEMA
// Post with automation engagement data
// ============================================

export const TopPostSchema = z.object({
  id: z.string().uuid(),
  postid: z.string(),
  caption: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  media: z.string(),
  mediaType: z.enum(["IMAGE", "VIDEO", "CAROUSEL_ALBUM"]),
  automationId: z.string().uuid(),
  automationName: z.string(),
  automationActive: z.boolean(),
  dmHits: z.number().int().min(0),
  commentHits: z.number().int().min(0),
  totalHits: z.number().int().min(0),
});

// ============================================
// SCHEDULER STATS SCHEMA
// ============================================

export const SchedulerStatsSchema = z.object({
  scheduled: z.number().int().min(0),
  posted: z.number().int().min(0),
  failed: z.number().int().min(0),
  cancelled: z.number().int().min(0),
  total: z.number().int().min(0),
  successRate: z.number().min(0).max(100),
});

// ============================================
// KEYWORD STAT SCHEMA
// Aggregated keyword hit data
// ============================================

export const KeywordStatSchema = z.object({
  word: z.string(),
  automationCount: z.number().int().min(0),
  totalHits: z.number().int().min(0),
});

// ============================================
// TELEMETRY SUMMARY SCHEMA
// High-level summary metrics
// ============================================

export const TelemetrySummarySchema = z.object({
  activeAutomations: z.number().int().min(0),
  totalAutomations: z.number().int().min(0),
  totalAutomatedActions: z.number().int().min(0),
  responseRate: z.number().min(0).max(100),
  topPerformerName: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  topPerformerHits: z.number().int().min(0),
});

// ============================================
// TELEMETRY DASHBOARD SCHEMA
// Full response: the complete telemetry payload
// ============================================

export const TelemetryDashboardSchema = z.object({
  summary: TelemetrySummarySchema,
  automationHealth: z.array(AutomationHealthSchema),
  topPosts: z.array(TopPostSchema),
  schedulerStats: SchedulerStatsSchema,
  keywordStats: z.array(KeywordStatSchema),
});

// ============================================
// QUERY SCHEMA
// ============================================

export const TelemetryQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
});

// ============================================
// EXPORTED TYPES
// ============================================

export type AutomationHealth = z.infer<typeof AutomationHealthSchema>;
export type TopPost = z.infer<typeof TopPostSchema>;
export type SchedulerStats = z.infer<typeof SchedulerStatsSchema>;
export type KeywordStat = z.infer<typeof KeywordStatSchema>;
export type TelemetrySummary = z.infer<typeof TelemetrySummarySchema>;
export type TelemetryDashboard = z.infer<typeof TelemetryDashboardSchema>;
export type TelemetryQuery = z.infer<typeof TelemetryQuerySchema>;
