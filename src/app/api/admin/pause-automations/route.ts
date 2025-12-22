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
 * POST /api/admin/pause-automations
 * Pause all automations for a user (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Pause all automations for this user
    const result = await client.automation.updateMany({
      where: { userId },
      data: { active: false },
    });

    // Create notification for the user
    await client.notification.create({
      data: {
        userId,
        content: "⚠️ Your automations have been paused due to subscription changes.",
      },
    });

    return NextResponse.json({
      success: true,
      automationsPaused: result.count,
    });
  } catch (error) {
    console.error("Error pausing automations:", error);
    return NextResponse.json(
      { error: "Failed to pause automations" },
      { status: 500 }
    );
  }
}
