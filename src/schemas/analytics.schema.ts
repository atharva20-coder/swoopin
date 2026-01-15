import { z } from "zod";

/**
 * ============================================
 * ANALYTICS SCHEMAS (Contract-Driven Design)
 * ============================================
 */

// ============================================
// ANALYTICS RECORD SCHEMA
// ============================================

export const AnalyticsRecordSchema = z.object({
  id: z.string().uuid(),
  date: z.coerce.date(),
  dmCount: z.number().int().min(0),
  commentCount: z.number().int().min(0),
});

// ============================================
// CHART DATA SCHEMA
// ============================================

export const ChartDataPointSchema = z.object({
  date: z.coerce.date(),
  month: z.string(),
  activity: z.number().int(),
  dmCount: z.number().int(),
  commentCount: z.number().int(),
});

export const ChartDataSchema = z.array(ChartDataPointSchema);

// ============================================
// DASHBOARD SCHEMA
// ============================================

export const AnalyticsDashboardSchema = z.object({
  totalDms: z.number().int().min(0),
  totalComments: z.number().int().min(0),
  chartData: ChartDataSchema,
});

// ============================================
// REQUEST SCHEMAS
// ============================================

export const TrackEventRequestSchema = z.object({
  type: z.enum(["dm", "comment"]),
});

export const AnalyticsQuerySchema = z.object({
  period: z.coerce.number().min(1).max(365).default(30),
  limit: z.coerce.number().min(1).max(100).default(6),
});

// ============================================
// EXPORTED TYPES
// ============================================

export type AnalyticsRecord = z.infer<typeof AnalyticsRecordSchema>;
export type ChartDataPoint = z.infer<typeof ChartDataPointSchema>;
export type AnalyticsDashboard = z.infer<typeof AnalyticsDashboardSchema>;
export type TrackEventRequest = z.infer<typeof TrackEventRequestSchema>;
export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;
