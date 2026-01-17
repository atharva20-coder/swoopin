import { client } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

// Force dynamic rendering - this route uses headers for authentication
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/subscriptions
 *
 * Get subscription stats and list of paid subscribers.
 * Requires admin authentication.
 */
export async function GET(req: NextRequest) {
  // Require admin authentication
  const adminError = await requireAdmin();
  if (adminError) {
    return adminError;
  }

  try {
    // Get user counts by plan
    const [totalUsers, freeUsers, proUsers, enterpriseUsers] =
      await Promise.all([
        client.user.count(),
        client.subscription.count({ where: { plan: "FREE" } }),
        client.subscription.count({ where: { plan: "PRO" } }),
        client.subscription.count({ where: { plan: "ENTERPRISE" } }),
      ]);

    // Get subscriptions with user info (ordered by most recent)
    const subscriptions = await client.subscription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        User: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // Calculate stats
    const stats = {
      totalUsers,
      freeUsers,
      proUsers,
      enterpriseUsers,
      // These would come from Stripe in a real implementation
      totalRevenue: 0,
      monthlyRevenue: 0,
    };

    return NextResponse.json({
      success: true,
      stats,
      subscriptions,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Server Error", message: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
