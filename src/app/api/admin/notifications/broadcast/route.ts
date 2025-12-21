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
 * POST /api/admin/notifications/broadcast
 * Send notification to all users or filtered by plan
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, message, target } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Build content with optional title
    const content = title ? `${title}: ${message}` : message;

    // Get users based on target
    let users;
    if (target === 'all') {
      users = await client.user.findMany({
        select: { id: true },
      });
    } else {
      users = await client.user.findMany({
        where: {
          subscription: {
            plan: target.toUpperCase(),
          },
        },
        select: { id: true },
      });
    }

    // Create notifications for all users
    const notifications = await client.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        content,
      })),
    });

    return NextResponse.json({
      success: true,
      count: users.length,
      message: `Notification sent to ${users.length} users`,
    });
  } catch (error) {
    console.error("Error broadcasting notification:", error);
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 });
  }
}
