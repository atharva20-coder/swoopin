// API Route for scheduled post publishing cron job

import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/prisma";
import { schedulerService } from "@/services/scheduler.service";

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * ============================================
 * GET /api/cron/publish-scheduled-posts
 * Cron job to automatically publish due scheduled posts
 * Runs every minute via Vercel Cron
 * ============================================
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify cron secret (Vercel passes this in header)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // In production, verify the cron secret
    if (process.env.NODE_ENV === "production" && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        console.error("Cron: Unauthorized request");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    console.log("[Cron] Starting scheduled posts processing...");

    // Find all posts that are due to be published
    const now = new Date();
    const duePosts = await client.scheduledPost.findMany({
      where: {
        status: "SCHEDULED",
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        User: {
          select: {
            id: true,
            integrations: {
              where: { name: "INSTAGRAM" },
              select: { token: true, instagramId: true },
            },
          },
        },
      },
      take: 10, // Process max 10 posts per run to avoid timeout
      orderBy: { scheduledFor: "asc" },
    });

    console.log(`[Cron] Found ${duePosts.length} due posts to publish`);

    if (duePosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No posts to publish",
        processed: 0,
      });
    }

    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const post of duePosts) {
      try {
        console.log(`[Cron] Publishing post ${post.id}...`);

        // Skip if no userId
        if (!post.userId) {
          console.error(`[Cron] Post ${post.id} has no userId, skipping`);
          continue;
        }

        // Use the schedulerService to publish
        const result = await schedulerService.publishPost(post.id, post.userId);

        results.push({
          id: post.id,
          success: result.success,
          error: result.error,
        });

        console.log(
          `[Cron] Post ${post.id}: ${result.success ? "SUCCESS" : "FAILED"} ${result.error || ""}`,
        );
      } catch (error) {
        console.error(`[Cron] Error publishing post ${post.id}:`, error);

        // Mark as failed
        await client.scheduledPost.update({
          where: { id: post.id },
          data: {
            status: "FAILED",
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
          },
        });

        results.push({
          id: post.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    console.log(
      `[Cron] Completed: ${successCount} success, ${failCount} failed`,
    );

    return NextResponse.json({
      success: true,
      message: `Processed ${duePosts.length} posts`,
      processed: duePosts.length,
      successCount,
      failCount,
      results,
    });
  } catch (error) {
    console.error("[Cron] Fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
