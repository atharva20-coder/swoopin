import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getAdminSession } from "@/lib/admin";

// Force dynamic rendering - this route uses headers for authentication
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/check
 *
 * Check if the current user is an admin.
 * Returns admin status and email.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({
        isAdmin: false,
        error: "Not authenticated or not an admin",
      });
    }

    return NextResponse.json({
      isAdmin: true,
      email: session.user.email,
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({
      isAdmin: false,
      error: "Failed to check admin status",
    });
  }
}
