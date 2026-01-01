import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/rate-limiter";
import { enqueueWebhookJob } from "@/lib/queue";
import { verifyInstagramSignature, verifySubscription } from "@/lib/instagram-webhook";

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
      { status: 401 }
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

  try {
    // Validate payload has required structure
    if (!webhookPayload.entry?.[0]) {
      return NextResponse.json({ message: "Invalid payload structure" }, { status: 200 });
    }

    // Check if QStash is configured
    if (process.env.QSTASH_TOKEN) {
      // Enqueue for reliable async processing with retries
      const result = await enqueueWebhookJob({
        webhookPayload,
        receivedAt: new Date().toISOString(),
      });

      console.log("Instagram webhook: Enqueued for processing", result.messageId);

      // Return 200 immediately - Instagram requires fast response
      return NextResponse.json(
        { message: "Queued for processing", jobId: result.messageId },
        { status: 200 }
      );
    }

    // Fallback: Process directly if QStash not configured (development mode)
    console.log("Instagram webhook: Processing directly (QStash not configured)");
    
    const { processWebhookDirectly } = await import("./direct-process");
    const result = await processWebhookDirectly(webhookPayload);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Instagram webhook: Processing error", error);
    // Return 200 to Instagram even on error (they don't retry on 500)
    return NextResponse.json(
      { message: "Processing error", error: String(error) },
      { status: 200 }
    );
  }
}