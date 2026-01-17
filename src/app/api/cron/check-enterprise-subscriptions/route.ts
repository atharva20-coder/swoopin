import { client } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering - this route uses request.headers
export const dynamic = "force-dynamic";

// Secret for authenticating cron requests (set in Vercel cron config or external service)
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * GET /api/cron/check-enterprise-subscriptions
 *
 * Checks for expired enterprise subscriptions and:
 * 1. Downgrades user to FREE plan
 * 2. Pauses all automations
 * 3. Creates notification
 *
 * Should be called daily via Vercel cron or external service
 *
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const providedSecret = authHeader?.replace("Bearer ", "");

    if (CRON_SECRET && providedSecret !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find active enterprise enquiries where subscriptionEndDate has passed
    const expiredEnquiries = await client.enterpriseEnquiry.findMany({
      where: {
        isActive: true,
        subscriptionEndDate: {
          lt: now,
        },
      },
      include: {
        User: {
          include: {
            subscription: true,
            automations: true,
          },
        },
      },
    });

    const results = {
      processed: 0,
      downgraded: 0,
      automationsPaused: 0,
      errors: [] as string[],
    };

    for (const enquiry of expiredEnquiries) {
      try {
        const user = (enquiry as any).User;

        // 1. Mark enquiry as inactive
        await client.enterpriseEnquiry.update({
          where: { id: enquiry.id },
          data: { isActive: false },
        });

        // 2. Downgrade subscription to FREE
        if (user.subscription) {
          await client.subscription.update({
            where: { id: user.subscription.id },
            data: {
              plan: "FREE",
              currentPeriodEnd: null,
            },
          });
        }

        // 3. Pause all automations
        const automationsCount = await client.automation.updateMany({
          where: { userId: user.id },
          data: { active: false },
        });

        results.automationsPaused += automationsCount.count;

        // 4. Create notification
        await client.notification.create({
          data: {
            userId: user.id,
            content:
              "⚠️ Your Enterprise subscription has expired. You've been moved to the FREE plan and your automations have been paused. Contact support to renew.",
          },
        });

        results.downgraded++;
        results.processed++;

        console.log(
          `Downgraded user ${user.email} - paused ${automationsCount.count} automations`
        );
      } catch (error) {
        results.errors.push(
          `Failed to process enquiry ${enquiry.id}: ${error}`
        );
        results.processed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} expired subscriptions`,
      results,
      checkedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Error checking enterprise subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to check subscriptions" },
      { status: 500 }
    );
  }
}
