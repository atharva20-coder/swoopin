import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  TelemetryDashboardSchema,
  type TelemetryDashboard,
} from "@/schemas/telemetry.schema";

/**
 * ============================================
 * TELEMETRY API RESPONSE SCHEMA
 * Zero-Patchwork Protocol: validate at gateway
 * ============================================
 */

const TelemetryApiResponseSchema = z.object({
  success: z.boolean(),
  data: TelemetryDashboardSchema.optional(),
});

type TelemetryApiResponse = z.infer<typeof TelemetryApiResponseSchema>;

/**
 * ============================================
 * FETCHER WITH ZOD VALIDATION
 * ============================================
 */

async function fetchTelemetry(): Promise<TelemetryApiResponse> {
  const res = await fetch("/api/v1/telemetry");
  const json = await res.json();

  const parsed = TelemetryApiResponseSchema.safeParse(json);
  if (!parsed.success) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[DEBUG] fetchTelemetry parse warning:",
        parsed.error.format(),
      );
    }
    return { success: false, data: undefined };
  }
  return parsed.data;
}

/**
 * ============================================
 * REACT QUERY HOOK
 * Returns fully typed, Zod-validated telemetry data
 * ============================================
 */

export const useTelemetry = () => {
  return useQuery<TelemetryApiResponse>({
    queryKey: ["telemetry-dashboard"],
    queryFn: fetchTelemetry,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * ============================================
 * CONVENIENCE SELECTORS
 * For components that only need specific data
 * ============================================
 */

export const useTelemetrySummary = () => {
  const query = useTelemetry();
  return {
    ...query,
    data: query.data?.data?.summary,
  };
};

export const useSchedulerStats = () => {
  const query = useTelemetry();
  return {
    ...query,
    data: query.data?.data?.schedulerStats,
  };
};

// Re-export types for consumers
export type { TelemetryDashboard };
