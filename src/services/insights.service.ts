import { client } from "@/lib/prisma";
import {
  InstagramInsightsDataSchema,
  type InstagramInsightsData,
} from "@/schemas/insights.schema";

/**
 * ============================================
 * INSIGHTS SERVICE
 * Computes insights from local Analytics data
 * No external API calls - uses database only
 * ============================================
 */

class InsightsService {
  /**
   * Get insights for a user computed from local Analytics data
   * Returns activity metrics based on tracked DMs and comments
   */
  async getInsights(
    userId: string,
  ): Promise<InstagramInsightsData | { error: string }> {
    try {
      // Get last 30 days of analytics data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [analytics, automations] = await Promise.all([
        client.analytics.findMany({
          where: {
            userId,
            date: { gte: thirtyDaysAgo },
          },
          orderBy: { date: "asc" },
        }),
        client.automation.findMany({
          where: { userId },
          include: { listener: true },
        }),
      ]);

      // Calculate totals from automations (lifetime counts)
      const totalDms = automations.reduce(
        (sum, auto) => sum + (auto.listener?.dmCount || 0),
        0,
      );
      const totalComments = automations.reduce(
        (sum, auto) => sum + (auto.listener?.commentCount || 0),
        0,
      );

      // Calculate 30-day activity from analytics
      const recentDms = analytics.reduce((sum, a) => sum + a.dmCount, 0);
      const recentComments = analytics.reduce(
        (sum, a) => sum + a.commentCount,
        0,
      );

      // Build account insights from local data
      const account = {
        followers_count: 0, // Not available without Instagram API
        follows_count: 0,
        media_count: 0,
        impressions: totalDms + totalComments, // Total interactions
        profile_views: 0, // Not available without Instagram API
        reach: recentDms + recentComments, // 30-day reach approximation
        website_clicks: 0,
      };

      // Activity growth data (last 30 days)
      const followerGrowth = analytics.map((a) => ({
        date: a.date.toISOString().split("T")[0],
        value: a.dmCount + a.commentCount,
      }));

      // Audience demographics not available locally
      const audience = null;

      const insightsData = {
        account,
        audience,
        followerGrowth,
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
        console.error("Error computing local insights:", error.message);
        return { error: error.message };
      }
      return { error: "Failed to compute insights" };
    }
  }
}

// Export singleton instance
export const insightsService = new InsightsService();
