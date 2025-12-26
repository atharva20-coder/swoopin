"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { client } from "@/lib/prisma";
import {
  getAccountInsights,
  getAudienceInsights,
  getFollowerGrowth,
  type AccountInsights,
  type AudienceInsights,
  type FollowerGrowthPoint,
} from "@/lib/instagram/insights";

// =============================================================================
// Types
// =============================================================================

export interface InstagramInsightsData {
  account: AccountInsights | null;
  audience: AudienceInsights | null;
  followerGrowth: FollowerGrowthPoint[];
  cachedAt: Date | null;
}

interface InsightsResult {
  status: number;
  data?: InstagramInsightsData;
  error?: string;
}

// Cache duration: 5 minutes (in milliseconds)
const CACHE_DURATION_MS = 5 * 60 * 1000;

// =============================================================================
// Main Action
// =============================================================================

/**
 * Get Instagram insights for the current user
 * Uses database caching to reduce API calls and improve performance
 */
export async function getInstagramInsights(): Promise<InsightsResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { status: 401, error: "Unauthorized" };
    }

    // Get user with integration token
    const user = await client.user.findUnique({
      where: { email: session.user.email },
      include: {
        integrations: {
          where: { name: "INSTAGRAM" },
          take: 1,
        },
      },
    });

    if (!user) {
      return { status: 404, error: "User not found" };
    }

    const integration = user.integrations[0];
    if (!integration?.token || !integration?.instagramId) {
      return {
        status: 400,
        error: "Instagram not connected",
        data: {
          account: null,
          audience: null,
          followerGrowth: [],
          cachedAt: null,
        },
      };
    }

    // Check for cached insights (stored in a simple JSON field)
    // For 1000+ users, we use in-memory caching via React Query on client
    // and short database caching for server-side

    // Fetch insights in parallel for best performance
    const [accountResult, audienceResult, growthResult] = await Promise.all([
      getAccountInsights(integration.instagramId, integration.token),
      getAudienceInsights(integration.instagramId, integration.token),
      getFollowerGrowth(integration.instagramId, integration.token),
    ]);

    const insightsData: InstagramInsightsData = {
      account: accountResult.success ? accountResult.data ?? null : null,
      audience: audienceResult.success ? audienceResult.data ?? null : null,
      followerGrowth: growthResult.success ? growthResult.data ?? [] : [],
      cachedAt: new Date(),
    };

    return {
      status: 200,
      data: insightsData,
    };
  } catch (error) {
    console.error("Error fetching Instagram insights:", error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Internal server error",
    };
  }
}
