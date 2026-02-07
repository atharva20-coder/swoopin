import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { youtubeService } from "@/services/youtube.service";
import {
  initializeNodeRegistry,
  runWorkflow,
  type ExecutionContext,
  type FlowNodeRuntime,
  type FlowEdgeRuntime,
} from "@/lib/flow-runner";
import { Redis } from "@upstash/redis";

/**
 * ============================================
 * YOUTUBE COMMENT POLLER JOB
 * Polls YouTube for new comments and triggers automations
 * Scheduled via QStash cron (since YouTube doesn't support webhooks)
 * ============================================
 */

// Initialize QStash receiver for signature verification
const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

// Redis for deduplication
const redis = Redis.fromEnv();
const PROCESSED_COMMENTS_KEY = "youtube:processed_comments";
const COMMENT_TTL_HOURS = 24;

export async function POST(req: NextRequest) {
  // Verify request is from QStash
  const signature = req.headers.get("upstash-signature");
  const body = await req.text();

  if (process.env.NODE_ENV === "production" && signature) {
    try {
      await receiver.verify({ signature, body });
    } catch (error) {
      console.error("QStash: Invalid signature", error);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  console.log("[YouTubePoller] Starting poll cycle");

  try {
    // Get all active YouTube integrations
    const integrations = await youtubeService.getActiveIntegrations();
    console.log(`[YouTubePoller] Found ${integrations.length} integrations`);

    let processedCount = 0;
    let errorCount = 0;

    for (const integration of integrations) {
      try {
        // Refresh access token (YouTube tokens expire quickly)
        const accessToken = await youtubeService.refreshAccessToken(
          integration.refreshToken,
        );

        if (!accessToken) {
          console.error(
            `[YouTubePoller] Token refresh failed for user ${integration.userId}`,
          );
          errorCount++;
          continue;
        }

        // Fetch recent comments
        const comments = await youtubeService.fetchRecentComments(
          accessToken,
          integration.channelId,
        );

        console.log(
          `[YouTubePoller] Fetched ${comments.length} comments for channel ${integration.channelId}`,
        );

        // Find YouTube automations for this user
        const automations = await youtubeService.findYouTubeAutomations(
          integration.userId,
        );

        if (automations.length === 0) {
          continue;
        }

        // Process each comment
        for (const thread of comments) {
          const commentId = thread.snippet.topLevelComment.id;

          // Check if already processed (Redis deduplication)
          const alreadyProcessed = await redis.sismember(
            PROCESSED_COMMENTS_KEY,
            commentId,
          );

          if (alreadyProcessed) {
            continue;
          }

          // Mark as processed immediately (prevent duplicate processing)
          await redis.sadd(PROCESSED_COMMENTS_KEY, commentId);
          // Set TTL on the set (approximate cleanup)
          await redis.expire(
            PROCESSED_COMMENTS_KEY,
            COMMENT_TTL_HOURS * 60 * 60,
          );

          // Execute automations for this comment
          for (const automation of automations) {
            try {
              initializeNodeRegistry();

              const context: ExecutionContext = {
                automationId: automation.id,
                userId: integration.userId,
                token: "", // Not used for YouTube
                pageId: integration.channelId,
                senderId:
                  thread.snippet.topLevelComment.snippet.authorChannelId.value,
                messageText:
                  thread.snippet.topLevelComment.snippet.textOriginal,
                triggerType: "YOUTUBE_COMMENT",
                youtubeToken: accessToken,
                youtubeChannelId: integration.channelId,
                youtubeVideoId: thread.snippet.videoId,
                youtubeCommentId: commentId,
              };

              const runtimeNodes: FlowNodeRuntime[] = automation.flowNodes.map(
                (node: any) => ({
                  nodeId: node.nodeId,
                  type: node.type,
                  subType: node.subType,
                  label: node.label,
                  config: (node.config as Record<string, unknown>) || {},
                }),
              );

              const runtimeEdges: FlowEdgeRuntime[] = (
                automation.flowEdges || []
              ).map((edge: any) => ({
                edgeId: edge.edgeId,
                sourceNodeId: edge.sourceNodeId,
                targetNodeId: edge.targetNodeId,
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
              }));

              const result = await runWorkflow(
                runtimeNodes,
                runtimeEdges,
                context,
              );

              console.log(
                `[YouTubePoller] Automation ${automation.id} result:`,
                result.success,
              );
              processedCount++;
            } catch (automationError) {
              console.error(
                `[YouTubePoller] Automation ${automation.id} failed:`,
                automationError,
              );
              errorCount++;
            }
          }
        }
      } catch (integrationError) {
        console.error(
          `[YouTubePoller] Integration ${integration.id} failed:`,
          integrationError,
        );
        errorCount++;
      }
    }

    console.log(
      `[YouTubePoller] Cycle complete: ${processedCount} processed, ${errorCount} errors`,
    );

    return NextResponse.json({
      success: true,
      processed: processedCount,
      errors: errorCount,
    });
  } catch (error) {
    console.error("[YouTubePoller] Fatal error:", error);
    return NextResponse.json(
      { error: "Polling failed", details: String(error) },
      { status: 500 },
    );
  }
}
