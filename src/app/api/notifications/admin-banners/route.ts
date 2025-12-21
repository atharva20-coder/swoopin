import { client } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * GET /api/notifications/admin-banners
 * Get recent admin notifications for the current user (last 7 days)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await client.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get recent notifications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const notifications = await client.notification.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: sevenDaysAgo },
        // Only get notifications that look like admin broadcasts (contain ":")
        content: { contains: ":" },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching admin banners:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
