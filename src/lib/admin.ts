import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Cached admin email list parsed from environment variable.
 * Format: ADMIN_EMAILS=admin1@example.com,admin2@example.com
 */
const getAdminEmails = (): string[] => {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
};

/**
 * Get current authenticated session.
 * Returns null if not authenticated.
 */
export const getAuthSession = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};

/**
 * Check if the current user is an admin.
 * Returns false if not authenticated or not in admin list.
 */
export const isAdmin = async (): Promise<boolean> => {
  const session = await getAuthSession();
  
  if (!session?.user?.email) {
    return false;
  }
  
  const adminEmails = getAdminEmails();
  return adminEmails.includes(session.user.email.toLowerCase());
};

/**
 * Get admin session or null.
 * Returns the session if user is admin, null otherwise.
 */
export const getAdminSession = async () => {
  const session = await getAuthSession();
  
  if (!session?.user?.email) {
    return null;
  }
  
  const adminEmails = getAdminEmails();
  if (!adminEmails.includes(session.user.email.toLowerCase())) {
    return null;
  }
  
  return session;
};

/**
 * Require admin authentication for API routes.
 * Returns a 401 response if not admin, null if authorized.
 */
export const requireAdmin = async (): Promise<NextResponse | null> => {
  const session = await getAdminSession();
  
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Admin access required" },
      { status: 401 }
    );
  }
  
  return null;
};

/**
 * Require authentication for API routes.
 * Returns a 401 response if not authenticated, null if authorized.
 */
export const requireAuth = async (): Promise<{ response: NextResponse } | { session: NonNullable<Awaited<ReturnType<typeof getAuthSession>>> }> => {
  const session = await getAuthSession();
  
  if (!session?.user) {
    return {
      response: NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      ),
    };
  }
  
  return { session };
};
