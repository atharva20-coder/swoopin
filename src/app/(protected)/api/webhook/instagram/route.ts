import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/rate-limiter";
import { enqueueWebhookJob } from "@/lib/queue";
import {
  verifyInstagramSignature,
  verifySubscription,
} from "@/lib/instagram-webhook";

// =================================================================
// COMMENT DEDUPLICATION (Global Map with TTL)
// Prevents same comment from being queued multiple times
// =================================================================
const processedCommentsAtEntry = new Map<string, number>();
const ENTRY_COMMENT_TTL_MS = 60 * 60 * 1000; // 1 hour

function isCommentProcessedAtEntry(commentId: string): boolean {
  const timestamp = processedCommentsAtEntry.get(commentId);
  if (!timestamp) return false;
  if (Date.now() - timestamp > ENTRY_COMMENT_TTL_MS) {
    processedCommentsAtEntry.delete(commentId);
    return false;
  }
  return true;
}

function markCommentProcessedAtEntry(commentId: string): void {
  processedCommentsAtEntry.set(commentId, Date.now());
  // Cleanup old entries every 100 entries
  if (processedCommentsAtEntry.size > 100) {
    const now = Date.now();
    for (const [id, ts] of processedCommentsAtEntry.entries()) {
      if (now - ts > ENTRY_COMMENT_TTL_MS) {
        processedCommentsAtEntry.delete(id);
      }
    }
  }
}
/**
 * GET /api/webhook/instagram
 *
 * Webhook subscription verification endpoint.
 * Instagram sends a challenge request that must be verified
 * using the verify token.
 */
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  const verifiedChallenge = verifySubscription(mode, token, challenge);

  if (verifiedChallenge) {
    console.log("Instagram webhook: Subscription verified");
    return new NextResponse(verifiedChallenge);
  }

  console.error("Instagram webhook: Subscription verification failed");
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * POST /api/webhook/instagram
 *
 * Webhook event handler.
 * All incoming webhooks are verified using X-Hub-Signature-256
 * before processing.
 */
export async function POST(req: NextRequest) {
  // Apply rate limiting (WEBHOOK tier - 1000 requests/minute)
  const rateLimitResult = await applyRateLimit(req, "WEBHOOK");
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  // Get raw body for signature verification
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  // Verify webhook signature
  if (!verifyInstagramSignature(rawBody, signature)) {
    console.error("Instagram webhook: Invalid signature");
    // Return 401 for invalid signatures
    return NextResponse.json(
      { error: "Unauthorized", message: "Invalid webhook signature" },
      { status: 401 },
    );
  }

  // Parse verified payload
  let webhookPayload: any;
  try {
    webhookPayload = JSON.parse(rawBody);
  } catch (error) {
    console.error("Instagram webhook: Invalid JSON payload");
    return NextResponse.json({ message: "Invalid payload" }, { status: 200 });
  }

  console.log("Instagram webhook: Verified and received");

  // =================================================================
  // COMMENT DEDUPLICATION AT ENTRY POINT
  // Check for comments and skip duplicates BEFORE queueing
  // This prevents the same comment from being queued multiple times
  // =================================================================
  if (webhookPayload.entry?.[0]?.changes) {
    const change = webhookPayload.entry[0].changes[0];
    const pageId = webhookPayload.entry[0].id;
    const senderId = change?.value?.from?.id;
    const parentId = change?.value?.parent_id;
    const commentId = change?.value?.id;

    // Skip self-comments (from page itself)
    if (senderId === pageId) {
      console.log("Instagram webhook: Skipping self-comment");
      return NextResponse.json(
        { message: "Self-comment ignored" },
        { status: 200 },
      );
    }

    // Skip comment replies (sub-comments) - these include bot's own replies
    if (parentId) {
      console.log("Instagram webhook: Skipping comment reply (sub-comment)");
      return NextResponse.json(
        { message: "Comment reply ignored" },
        { status: 200 },
      );
    }

    // Skip already processed comments (using global Set with 1h TTL)
    if (commentId && isCommentProcessedAtEntry(commentId)) {
      console.log(`Instagram webhook: Comment ${commentId} already processed`);
      return NextResponse.json(
        { message: "Comment already processed" },
        { status: 200 },
      );
    }

    // Mark comment as processed BEFORE queueing
    if (commentId) {
      markCommentProcessedAtEntry(commentId);
    }
  }

  try {
    // Validate payload has required structure
    if (!webhookPayload.entry?.[0]) {
      return NextResponse.json(
        { message: "Invalid payload structure" },
        { status: 200 },
      );
    }

    // Check if QStash is configured
    if (process.env.QSTASH_TOKEN) {
      // Enqueue for reliable async processing with retries
      const result = await enqueueWebhookJob({
        webhookPayload,
        receivedAt: new Date().toISOString(),
      });

      console.log(
        "Instagram webhook: Enqueued for processing",
        result.messageId,
      );

      // Return 200 immediately - Instagram requires fast response
      return NextResponse.json(
        { message: "Queued for processing", jobId: result.messageId },
        { status: 200 },
      );
    }

    // Fallback: Process directly if QStash not configured (development mode)
    console.log(
      "Instagram webhook: Processing directly (QStash not configured)",
    );

    const { processWebhookDirectly } = await import("./direct-process");
    const result = await processWebhookDirectly(webhookPayload);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Instagram webhook: Processing error", error);
    // Return 200 to Instagram even on error (they don't retry on 500)
    return NextResponse.json(
      { message: "Processing error", error: String(error) },
      { status: 200 },
    );
  }
}
