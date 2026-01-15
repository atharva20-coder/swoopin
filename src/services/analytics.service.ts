import { client } from "@/lib/prisma";
import {
  AnalyticsDashboardSchema,
  type AnalyticsDashboard,
  type AnalyticsQuery,
  type AnalyticsRecord,
} from "@/schemas/analytics.schema";

/**
 * ============================================
 * ANALYTICS SERVICE
 * Business logic for analytics dashboard and tracking
 * ============================================
 */

class AnalyticsService {
  /**
   * Get analytics dashboard data for a user
   */
  async getDashboard(
    userId: string,
    query: AnalyticsQuery
  ): Promise<AnalyticsDashboard> {
    // Get user with analytics and automation data
    const dbUser = await client.user.findUnique({
      where: { id: userId },
      include: {
        analytics: {
          orderBy: { date: "asc" },
          take: query.limit,
        },
        automations: {
          include: {
            listener: true,
          },
        },
      },
    });

    if (!dbUser) {
      return { totalDms: 0, totalComments: 0, chartData: [] };
    }

    // Calculate totals from automations
    const totalDms = dbUser.automations.reduce(
      (sum, auto) => sum + (auto.listener?.dmCount || 0),
      0
    );

    const totalComments = dbUser.automations.reduce(
      (sum, auto) => sum + (auto.listener?.commentCount || 0),
      0
    );

    // Format chart data
    const chartData = dbUser.analytics.map((item) => ({
      date: item.date,
      month: item.date.toLocaleDateString("en-US", { month: "long" }),
      activity: item.dmCount + item.commentCount,
      dmCount: item.dmCount,
      commentCount: item.commentCount,
    }));

    const result = { totalDms, totalComments, chartData };
    const validated = AnalyticsDashboardSchema.safeParse(result);

    return validated.success
      ? validated.data
      : { totalDms: 0, totalComments: 0, chartData: [] };
  }

  /**
   * Track an analytics event (DM or comment)
   * Used by background jobs/webhooks
   */
  async trackEvent(
    userId: string,
    type: "dm" | "comment"
  ): Promise<AnalyticsRecord | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find existing record for today
    const existing = await client.analytics.findFirst({
      where: {
        userId,
        date: today,
      },
    });

    if (existing) {
      // Update existing record
      const updated = await client.analytics.update({
        where: { id: existing.id },
        data: {
          [type === "dm" ? "dmCount" : "commentCount"]: {
            increment: 1,
          },
        },
      });

      return {
        id: updated.id,
        date: updated.date,
        dmCount: updated.dmCount,
        commentCount: updated.commentCount,
      };
    } else {
      // Create new record for today
      const created = await client.analytics.create({
        data: {
          userId,
          date: today,
          dmCount: type === "dm" ? 1 : 0,
          commentCount: type === "comment" ? 1 : 0,
        },
      });

      return {
        id: created.id,
        date: created.date,
        dmCount: created.dmCount,
        commentCount: created.commentCount,
      };
    }
  }

  /**
   * Get analytics summary for a date range
   */
  async getSummary(
    userId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<{ totalDms: number; totalComments: number }> {
    const analytics = await client.analytics.findMany({
      where: {
        userId,
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
    });

    const totalDms = analytics.reduce((sum, item) => sum + item.dmCount, 0);
    const totalComments = analytics.reduce(
      (sum, item) => sum + item.commentCount,
      0
    );

    return { totalDms, totalComments };
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
