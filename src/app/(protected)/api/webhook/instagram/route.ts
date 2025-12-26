import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/rate-limiter";
import { enqueueWebhookJob } from "@/lib/queue";

export async function GET(req: NextRequest) {
  const hub = req.nextUrl.searchParams.get("hub.challenge");
  return new NextResponse(hub);
}

export async function POST(req: NextRequest) {
  // Apply rate limiting (WEBHOOK tier - 1000 requests/minute)
  const rateLimitResult = await applyRateLimit(req, "WEBHOOK");
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  const webhook_payload = await req.json();
  console.log("Instagram webhook received");

  try {
    // Validate payload has required structure
    if (!webhook_payload.entry?.[0]) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 200 });
    }

    // Check if QStash is configured
    if (process.env.QSTASH_TOKEN) {
      // Enqueue for reliable async processing with retries
      const result = await enqueueWebhookJob({
        webhookPayload: webhook_payload,
        receivedAt: new Date().toISOString(),
      });

      console.log("Webhook enqueued:", result.messageId);

      // Return 200 immediately - Instagram requires fast response
      return NextResponse.json(
        { message: "Queued for processing", jobId: result.messageId },
        { status: 200 }
      );
    }

    // Fallback: Process directly if QStash not configured (development mode)
    console.log("QStash not configured, processing directly...");
    
    // Dynamic import to process webhook in-line (for dev/testing)
    const { processWebhookDirectly } = await import("./direct-process");
    const result = await processWebhookDirectly(webhook_payload);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    // Return 200 to Instagram even on error (they don't retry on 500)
    return NextResponse.json(
      { message: "Error processing webhook", error: String(error) },
      { status: 200 }
    );
  }
}