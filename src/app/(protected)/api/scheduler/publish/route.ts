import { NextRequest, NextResponse } from "next/server";
import { schedulerService } from "@/services/scheduler.service";
import { client } from "@/lib/prisma";

/**
 * Background job endpoint to publish scheduled posts
 * This can be triggered by:
 * - Vercel Cron (recommended for production)
 * - External cron service
 * - Manual trigger via API call
 *
 * Add to vercel.json for automatic scheduling:
 * crons: [{ path: "/api/scheduler/publish", schedule: "0/5 * * * *" }]
 */

// Verify cron secret for security
const verifyCronSecret = (req: NextRequest): boolean => {
  const cronSecret = process.env.CRON_SECRET;

  // If no secret is configured, allow the request (for development)
  if (!cronSecret) {
    console.warn("CRON_SECRET not configured - allowing request");
    return true;
  }

  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
};

// Process due scheduled posts using the service
async function processDueScheduledPosts() {
  const now = new Date();

  // Find all posts that are due for publishing
  const duePosts = await client.scheduledPost.findMany({
    where: {
      status: "SCHEDULED",
      scheduledFor: { lte: now },
    },
    include: {
      User: true,
    },
  });

  const results = [];

  for (const post of duePosts) {
    if (!post.userId) continue;

    const result = await schedulerService.publishPost(post.id, post.userId);
    results.push({
      postId: post.id,
      status: result.success ? 200 : 500,
      error: result.error,
    });
  }

  return { status: 200, data: results };
}

export async function GET(req: NextRequest) {
  // Check for Vercel Cron authorization
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting scheduled post publishing job...");

    const result = await processDueScheduledPosts();

    if (result.status === 200) {
      const published = result.data.filter(
        (r: { status: number }) => r.status === 200
      ).length;
      const failed = result.data.filter(
        (r: { status: number }) => r.status !== 200
      ).length;

      console.log(
        `Publishing job complete: ${published} published, ${failed} failed`
      );

      return NextResponse.json({
        success: true,
        message: `Processed ${result.data.length} posts`,
        published,
        failed,
        results: result.data,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process scheduled posts",
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error in publishing job:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(req: NextRequest) {
  return GET(req);
}
