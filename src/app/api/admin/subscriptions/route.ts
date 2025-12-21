import { client } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// List of admin email addresses
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter((email) => email.length > 0);

async function isAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session?.user) return false;
  return ADMIN_EMAILS.includes(session.user.email.toLowerCase());
}

/**
 * GET /api/admin/subscriptions
 * Get subscription stats and list of paid subscribers
 */
export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user counts by plan
    const [totalUsers, freeUsers, proUsers, enterpriseUsers] = await Promise.all([
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
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}
