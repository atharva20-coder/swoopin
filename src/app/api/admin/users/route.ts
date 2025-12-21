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
 * GET /api/admin/users
 * List all users with their subscription info
 */
export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
            customerId: true,
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
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
