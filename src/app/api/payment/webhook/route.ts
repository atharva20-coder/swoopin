/**
 * ============================================
 * CASHFREE WEBHOOK HANDLER
 * Handles payment confirmation webhooks from Cashfree
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server";
import { Cashfree } from "cashfree-pg";
import { client } from "@/lib/prisma";

// Initialize Cashfree SDK (v5+)
const cashfree = new Cashfree(
  process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "production"
    ? Cashfree.PRODUCTION
    : Cashfree.SANDBOX,
  process.env.CASHFREE_APP_ID!,
  process.env.CASHFREE_APP_SECRET!,
);

/**
 * POST /api/payment/webhook
 * Handles Cashfree payment webhooks
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const timestamp = req.headers.get("x-webhook-timestamp") || "";
    const signature = req.headers.get("x-webhook-signature") || "";

    // Verify signature in production
    if (process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "production") {
      try {
        cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
      } catch (verifyError) {
        console.error("Cashfree webhook: Invalid signature", verifyError);
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 },
        );
      }
    }

    const payload = JSON.parse(rawBody);
    console.log("Cashfree webhook received:", payload.type);

    // Handle different event types
    const eventType = payload.type;
    const data = payload.data;

    switch (eventType) {
      case "PAYMENT_SUCCESS_WEBHOOK":
      case "PAYMENT_SUCCESS": {
        const orderId = data.order?.order_id;
        const orderTags = data.order?.order_tags;

        if (!orderId) {
          console.error("Cashfree webhook: Missing order ID");
          return NextResponse.json({ received: true });
        }

        const userId = orderTags?.userId;

        if (!userId) {
          console.error("Cashfree webhook: Missing userId in order tags");
          return NextResponse.json({ received: true });
        }

        // Update subscription to PRO
        await client.subscription.upsert({
          where: { userId },
          create: {
            userId,
            plan: "PRO",
            cashfreeCustomerId: orderId,
          },
          update: {
            plan: "PRO",
            cashfreeCustomerId: orderId,
          },
        });

        console.log(`Cashfree webhook: User ${userId} upgraded to PRO`);
        break;
      }

      case "PAYMENT_FAILED_WEBHOOK":
      case "PAYMENT_FAILED": {
        console.log("Cashfree webhook: Payment failed", data.order?.order_id);
        break;
      }

      case "REFUND_SUCCESS_WEBHOOK":
      case "REFUND_SUCCESS": {
        const orderId = data.refund?.order_id;

        // Find subscription by order ID and downgrade
        const subscription = await client.subscription.findFirst({
          where: { cashfreeCustomerId: orderId },
        });

        if (subscription) {
          await client.subscription.update({
            where: { userId: subscription.userId ?? undefined },
            data: { plan: "FREE" },
          });
          console.log(
            `Cashfree webhook: User ${subscription.userId} refunded, downgraded to FREE`,
          );
        }
        break;
      }

      default:
        console.log(`Cashfree webhook: Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Cashfree webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
