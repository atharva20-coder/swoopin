import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// List of admin email addresses
// Set in .env file: ADMIN_EMAILS=admin1@example.com,admin2@example.com
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter((email) => email.length > 0);

/**
 * GET /api/admin/check
 * 
 * Check if the current user is an admin
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({
        isAdmin: false,
        error: "Not authenticated",
      });
    }

    const userEmail = session.user.email.toLowerCase();
    const isAdmin = ADMIN_EMAILS.includes(userEmail);

    return NextResponse.json({
      isAdmin,
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
