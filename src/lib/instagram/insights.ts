import axios from "axios";
import { getOrSetCache } from "@/lib/cache";

/**
 * Instagram Insights API Wrapper
 * Fetches account and media insights from Instagram Graph API v21.0
 * @see https://developers.facebook.com/docs/instagram-platform/insights
 */

// =============================================================================
// Types
// =============================================================================

export interface InsightValue {
  value: number | Record<string, number>;
  end_time?: string;
}

export interface InsightMetric {
  name: string;
  period: "day" | "week" | "days_28" | "lifetime";
  values: InsightValue[];
  title: string;
  description: string;
  id: string;
}

export interface AccountInsights {
  reach: number;
  followerCount: number;
  profileViews: number;
  websiteClicks: number;
  totalInteractions: number;
  accountsEngaged: number;
}

export interface AudienceDemographic {
  dimension: string;
  value: number;
  percentage: number;
}

export interface AudienceInsights {
  followerDemographics: AudienceDemographic[];
  reachedDemographics: AudienceDemographic[];
  engagedDemographics: AudienceDemographic[];
}

export interface MediaInsight {
  mediaId: string;
  reach: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  engagement: number;
}

export interface InsightsResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
}

// =============================================================================
// Account Insights
// =============================================================================

/**
 * Get account-level insights (reach, profile views, etc.)
 * Uses only valid metrics for Instagram Graph API v21.0
 * Requires: instagram_manage_insights permission
 * Cached for 5 minutes
 */
export async function getAccountInsights(
  userId: string,
  token: string,
  period: "day" | "week" | "days_28" = "days_28",
): Promise<InsightsResponse<AccountInsights>> {
  return await getOrSetCache(
    `user:${userId}:insights`,
    async () => {
      try {
        // Valid metrics for v21.0 (from API error response)
        // NOTE: removed follower_count as it causes errors with 'days_28' period
        const metrics = [
          "reach",
          "profile_views",
          "website_clicks",
          "total_interactions",
          "accounts_engaged",
        ].join(",");

        const response = await axios.get(
          `${process.env.INSTAGRAM_BASE_URL}/v21.0/${userId}/insights`,
          {
            params: {
              metric: metrics,
              period: period,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 10000,
          },
        );

        const data = response.data.data as InsightMetric[];
        const getValue = (name: string): number => {
          const metric = data.find((m) => m.name === name);
          const val = metric?.values[0]?.value;
          return typeof val === "number" ? val : 0;
        };

        const insights: AccountInsights = {
          reach: getValue("reach"),
          followerCount: 0, // Fetched via Profile API separately
          profileViews: getValue("profile_views"),
          websiteClicks: getValue("website_clicks"),
          totalInteractions: getValue("total_interactions"),
          accountsEngaged: getValue("accounts_engaged"),
        };

        return { success: true, data: insights };
      } catch (error) {
        // Detailed Logging for Debugging
        if (axios.isAxiosError(error)) {
          console.error("[Insights API Error] Status:", error.response?.status);
          console.error("[Insights API Error] URL:", error.config?.url);
          console.error("[Insights API Error] Params:", error.config?.params);
          console.error(
            "[Insights API Error] Response:",
            JSON.stringify(error.response?.data, null, 2),
          );
        } else {
          console.error("[Insights API Error] Unknown:", error);
        }

        // 403 errors are expected when permission not granted - handle silently
        if (!is403PermissionError(error)) {
          console.error("Error fetching account insights:", error);
        }
        return { success: false, error: getErrorMessage(error) };
      }
    },
    300, // 5 minutes TTL
  );
}

// =============================================================================
// Audience Demographics
// =============================================================================

/**
 * Get audience demographics (follower breakdown)
 * Uses only valid metrics for Instagram Graph API v21.0
 * Requires: instagram_manage_insights permission
 */
export async function getAudienceInsights(
  userId: string,
  token: string,
): Promise<InsightsResponse<AudienceInsights>> {
  try {
    // Valid demographic metrics for v21.0
    const metrics = [
      "follower_demographics",
      "reached_audience_demographics",
      "engaged_audience_demographics",
    ].join(",");

    const response = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/${userId}/insights`,
      {
        params: {
          metric: metrics,
          period: "lifetime",
          metric_type: "total_value",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      },
    );

    const data = response.data.data as InsightMetric[];

    const parseDemographic = (metricName: string): AudienceDemographic[] => {
      const metric = data.find((m) => m.name === metricName);
      if (!metric?.values[0]?.value) return [];

      const breakdown = metric.values[0].value as unknown as Record<
        string,
        number
      >;

      if (typeof breakdown !== "object") return [];

      const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

      return Object.entries(breakdown)
        .map(([dimension, value]) => ({
          dimension,
          value,
          percentage: total > 0 ? (value / total) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    };

    const insights: AudienceInsights = {
      followerDemographics: parseDemographic("follower_demographics"),
      reachedDemographics: parseDemographic("reached_audience_demographics"),
      engagedDemographics: parseDemographic("engaged_audience_demographics"),
    };

    return { success: true, data: insights };
  } catch (error) {
    // 403 errors are expected when permission not granted - handle silently
    if (!is403PermissionError(error)) {
      console.error("Error fetching audience insights:", error);
    }
    return { success: false, error: getErrorMessage(error) };
  }
}

// =============================================================================
// Media Insights
// =============================================================================

/**
 * Get insights for a specific media post
 * Uses only valid metrics for Instagram Graph API v21.0
 */
export async function getMediaInsights(
  mediaId: string,
  token: string,
): Promise<InsightsResponse<MediaInsight>> {
  try {
    // Valid media metrics for v21.0
    const metrics = ["reach", "likes", "comments", "saves", "shares"].join(",");

    const response = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/${mediaId}/insights`,
      {
        params: { metric: metrics },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      },
    );

    const data = response.data.data as InsightMetric[];
    const getValue = (name: string): number => {
      const metric = data.find((m) => m.name === name);
      const val = metric?.values[0]?.value;
      return typeof val === "number" ? val : 0;
    };

    const reach = getValue("reach");
    const likes = getValue("likes");
    const comments = getValue("comments");
    const saves = getValue("saves");
    const shares = getValue("shares");

    const insight: MediaInsight = {
      mediaId,
      reach,
      likes,
      comments,
      saves,
      shares,
      engagement:
        reach > 0 ? ((likes + comments + saves + shares) / reach) * 100 : 0,
    };

    return { success: true, data: insight };
  } catch (error) {
    // 403 errors are expected when permission not granted - handle silently
    if (!is403PermissionError(error)) {
      console.error("Error fetching media insights:", error);
    }
    return { success: false, error: getErrorMessage(error) };
  }
}

// =============================================================================
// Follower Growth (Daily Breakdown)
// =============================================================================

export interface FollowerGrowthPoint {
  date: string;
  followers: number;
  change: number;
}

/**
 * Get follower count over time
 */
export async function getFollowerGrowth(
  userId: string,
  token: string,
): Promise<InsightsResponse<FollowerGrowthPoint[]>> {
  try {
    const response = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/${userId}/insights`,
      {
        params: {
          metric: "follower_count",
          period: "day",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      },
    );

    const metric = response.data.data?.[0] as InsightMetric | undefined;
    if (!metric?.values) {
      return { success: true, data: [] };
    }

    let previousValue = 0;
    const growthData: FollowerGrowthPoint[] = metric.values.map((v, index) => {
      const val = typeof v.value === "number" ? v.value : 0;
      const change = index === 0 ? 0 : val - previousValue;
      previousValue = val;
      return {
        date: v.end_time || new Date().toISOString(),
        followers: val,
        change,
      };
    });

    return { success: true, data: growthData };
  } catch (error) {
    // 403 errors are expected when permission not granted - handle silently
    if (!is403PermissionError(error)) {
      console.error(
        "Error fetching follower growth: Require App Review from meta",
        error,
      );
    }
    return { success: false, error: getErrorMessage(error) };
  }
}

// =============================================================================
// Helpers
// =============================================================================

function is403PermissionError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 403;
  }
  return false;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const fbError = error.response?.data?.error;
    if (fbError?.message) {
      return fbError.message;
    }
    // Check www-authenticate header for detailed error
    const authHeader = error.response?.headers?.["www-authenticate"];
    if (authHeader && typeof authHeader === "string") {
      const match = authHeader.match(/"([^"]+)"$/);
      if (match) return match[1];
    }
    if (error.response?.status === 403) {
      return "Missing instagram_manage_insights permission";
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error occurred";
}
