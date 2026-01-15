import { client } from "@/lib/prisma";
import {
  getAccountInsights,
  getAudienceInsights,
  getFollowerGrowth,
} from "@/lib/instagram/insights";
import {
  InstagramInsightsDataSchema,
  type InstagramInsightsData,
} from "@/schemas/insights.schema";

/**
 * ============================================
 * INSIGHTS SERVICE
 * Business logic for Instagram insights
 * Uses parallel API calls for performance
 * ============================================
 */

class InsightsService {
  /**
   * Get Instagram insights for a user
   * Fetches account, audience, and follower growth data in parallel
   */
  async getInsights(
    userId: string
  ): Promise<InstagramInsightsData | { error: string }> {
    // Get user's integration
    const integration = await client.integrations.findFirst({
      where: {
        userId,
        name: "INSTAGRAM",
      },
    });

    if (!integration?.token || !integration?.instagramId) {
      return {
        account: null,
        audience: null,
        followerGrowth: [],
        cachedAt: null,
      };
    }

    try {
      // Fetch all insights in parallel for best performance
      const [accountResult, audienceResult, growthResult] = await Promise.all([
        getAccountInsights(integration.instagramId, integration.token),
        getAudienceInsights(integration.instagramId, integration.token),
        getFollowerGrowth(integration.instagramId, integration.token),
      ]);

      const insightsData = {
        account: accountResult.success ? accountResult.data ?? null : null,
        audience: audienceResult.success ? audienceResult.data ?? null : null,
        followerGrowth: growthResult.success ? growthResult.data ?? [] : [],
        cachedAt: new Date(),
      };

      const validated = InstagramInsightsDataSchema.safeParse(insightsData);
      if (!validated.success) {
        console.error("Insights validation failed:", validated.error.format());
        return {
          account: null,
          audience: null,
          followerGrowth: [],
          cachedAt: new Date(),
        };
      }

      return validated.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching insights:", error.message);
        return { error: error.message };
      }
      return { error: "Failed to fetch insights" };
    }
  }
}

// Export singleton instance
export const insightsService = new InsightsService();
