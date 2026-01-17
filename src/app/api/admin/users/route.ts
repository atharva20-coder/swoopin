import { client } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

// Force dynamic rendering - this route uses headers for authentication
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users
 *
 * List all users with their subscription info.
 * Requires admin authentication.
 */
export async function GET(req: NextRequest) {
  // Require admin authentication
  const adminError = await requireAdmin();
  if (adminError) {
    return adminError;
  }

  try {
    const users = await client.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        subscription: {
          select: {
            plan: true,
            cashfreeCustomerId: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Server Error", message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
