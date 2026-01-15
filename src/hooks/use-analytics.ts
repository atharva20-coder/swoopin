import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  AnalyticsDashboardSchema,
  type AnalyticsDashboard,
} from "@/schemas/analytics.schema";

/**
 * ============================================
 * ANALYTICS API RESPONSE SCHEMA
 * Following Zero-Patchwork Protocol:
 * - Parse at the gateway, keep core pure
 * ============================================
 */
const AnalyticsApiResponseSchema = z.object({
  status: z.number(),
  data: AnalyticsDashboardSchema.optional(),
});

export type AnalyticsApiResponse = z.infer<typeof AnalyticsApiResponseSchema>;

/**
 * Fetches user analytics from REST API with Zod validation
 */
async function fetchUserAnalytics(slug: string): Promise<AnalyticsApiResponse> {
  const res = await fetch(`/api/v1/analytics?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message ?? "Failed to fetch analytics");
  }
  const json = await res.json();
  // Parse and transform at the gateway - schema handles all normalizations
  return AnalyticsApiResponseSchema.parse(json);
}

export const useAnalytics = (slug: string) => {
  return useQuery<AnalyticsApiResponse>({
    queryKey: ["user-analytics", slug],
    queryFn: () => fetchUserAnalytics(slug),
  });
};

// Re-export types for consumers
export type { AnalyticsDashboard };
