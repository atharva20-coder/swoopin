import { client } from "@/lib/prisma";
import {
  TelemetryDashboardSchema,
  type TelemetryDashboard,
  type TelemetryQuery,
} from "@/schemas/telemetry.schema";

/**
 * ============================================
 * TELEMETRY SERVICE
 * Aggregates data from Automation, Listener,
 * Post, Keyword, and ScheduledPost models.
 * No external API calls — database only.
 * ============================================
 */

class TelemetryService {
  /**
   * Get the full telemetry dashboard for a user.
   * Service accepts pre-validated userId (from Gateway).
   */
  async getDashboard(
    userId: string,
    query: TelemetryQuery,
  ): Promise<TelemetryDashboard> {
    const limit = query.limit;

    // ── 1. Automation health: automations + listener hits + keyword/post counts ──
    const automations = await client.automation.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        active: true,
        createdAt: true,
        listener: {
          select: {
            dmCount: true,
            commentCount: true,
          },
        },
        keywords: {
          select: { word: true },
        },
        _count: {
          select: {
            posts: true,
            keywords: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const automationHealth = automations.map((a) => {
      const dmHits = a.listener?.dmCount ?? 0;
      const commentHits = a.listener?.commentCount ?? 0;
      return {
        id: a.id,
        name: a.name,
        active: a.active,
        dmHits,
        commentHits,
        totalHits: dmHits + commentHits,
        postCount: a._count.posts,
        keywordCount: a._count.keywords,
        keywords: a.keywords.map((k) => k.word),
        createdAt: a.createdAt,
      };
    });

    // Sort by total hits descending for ranking
    const sortedByHits = [...automationHealth].sort(
      (a, b) => b.totalHits - a.totalHits,
    );
    const topPerformer = sortedByHits[0] ?? null;

    // ── 2. Top posts by automation reach ──
    const postsWithAutomation = await client.post.findMany({
      where: {
        Automation: {
          userId,
        },
      },
      select: {
        id: true,
        postid: true,
        caption: true,
        media: true,
        mediaType: true,
        automationId: true,
        Automation: {
          select: {
            name: true,
            active: true,
            listener: {
              select: {
                dmCount: true,
                commentCount: true,
              },
            },
          },
        },
      },
      take: limit,
    });

    const topPosts = postsWithAutomation
      .map((p) => {
        const dmHits = p.Automation?.listener?.dmCount ?? 0;
        const commentHits = p.Automation?.listener?.commentCount ?? 0;
        return {
          id: p.id,
          postid: p.postid,
          caption: p.caption,
          media: p.media,
          mediaType: p.mediaType,
          automationId: p.automationId ?? "",
          automationName: p.Automation?.name ?? "Untitled",
          automationActive: p.Automation?.active ?? false,
          dmHits,
          commentHits,
          totalHits: dmHits + commentHits,
        };
      })
      .sort((a, b) => b.totalHits - a.totalHits);

    // ── 3. Scheduler stats ──
    const scheduledPosts = await client.scheduledPost.groupBy({
      by: ["status"],
      where: { userId },
      _count: { id: true },
    });

    const statusMap: Record<string, number> = {
      SCHEDULED: 0,
      POSTED: 0,
      FAILED: 0,
      CANCELLED: 0,
    };

    for (const row of scheduledPosts) {
      statusMap[row.status] = row._count.id;
    }

    const totalScheduled =
      statusMap.SCHEDULED +
      statusMap.POSTED +
      statusMap.FAILED +
      statusMap.CANCELLED;
    const successRate =
      totalScheduled > 0
        ? Math.round((statusMap.POSTED / totalScheduled) * 10000) / 100
        : 0;

    const schedulerStats = {
      scheduled: statusMap.SCHEDULED,
      posted: statusMap.POSTED,
      failed: statusMap.FAILED,
      cancelled: statusMap.CANCELLED,
      total: totalScheduled,
      successRate,
    };

    // ── 4. Keyword analytics ──
    // Aggregate keywords across all automations with hit counts
    const keywordMap = new Map<
      string,
      { automationCount: number; totalHits: number }
    >();

    for (const auto of automationHealth) {
      for (const word of auto.keywords) {
        const existing = keywordMap.get(word);
        if (existing) {
          existing.automationCount += 1;
          existing.totalHits += auto.totalHits;
        } else {
          keywordMap.set(word, {
            automationCount: 1,
            totalHits: auto.totalHits,
          });
        }
      }
    }

    const keywordStats = Array.from(keywordMap.entries())
      .map(([word, stats]) => ({
        word,
        automationCount: stats.automationCount,
        totalHits: stats.totalHits,
      }))
      .sort((a, b) => b.totalHits - a.totalHits)
      .slice(0, 10);

    // ── 5. Summary ──
    const totalAutomatedActions = automationHealth.reduce(
      (sum, a) => sum + a.totalHits,
      0,
    );
    const activeAutomations = automationHealth.filter((a) => a.active).length;

    // Response rate: automated actions / total incoming (from Analytics daily)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAnalytics = await client.analytics.aggregate({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
      },
      _sum: {
        dmCount: true,
        commentCount: true,
      },
    });

    const totalIncoming =
      (recentAnalytics._sum.dmCount ?? 0) +
      (recentAnalytics._sum.commentCount ?? 0);
    const responseRate =
      totalIncoming > 0
        ? Math.round((totalAutomatedActions / totalIncoming) * 10000) / 100
        : 0;

    const summary = {
      activeAutomations,
      totalAutomations: automationHealth.length,
      totalAutomatedActions,
      responseRate: Math.min(responseRate, 100),
      topPerformerName: topPerformer?.name ?? null,
      topPerformerHits: topPerformer?.totalHits ?? 0,
    };

    // ── 6. Validate full response through Zod ──
    const result = {
      summary,
      automationHealth,
      topPosts,
      schedulerStats,
      keywordStats,
    };

    const validated = TelemetryDashboardSchema.safeParse(result);
    if (!validated.success) {
      console.error("Telemetry validation failed:", validated.error.format());
      // Return safe defaults on validation failure
      return {
        summary: {
          activeAutomations: 0,
          totalAutomations: 0,
          totalAutomatedActions: 0,
          responseRate: 0,
          topPerformerName: null,
          topPerformerHits: 0,
        },
        automationHealth: [],
        topPosts: [],
        schedulerStats: {
          scheduled: 0,
          posted: 0,
          failed: 0,
          cancelled: 0,
          total: 0,
          successRate: 0,
        },
        keywordStats: [],
      };
    }

    return validated.data;
  }
}

// Export singleton instance
export const telemetryService = new TelemetryService();
