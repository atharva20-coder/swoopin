import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { client } from "@/lib/prisma";

/**
 * Auth helper to reduce duplicate DB queries in server actions
 * Returns user with integrations in a single optimized query
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthIntegration {
  id: string;
  token: string | null;
  instagramId: string | null;
  expiresAt: Date | null;
}

export interface AuthResult {
  user: AuthUser;
  integration: AuthIntegration | null;
}

/**
 * Get authenticated user with Instagram integration
 * Combines session check + DB lookup in one call
 */
export async function getAuthenticatedUser(): Promise<AuthResult | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return null;
    }

    // Single optimized query with minimal fields
    const user = await client.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        integrations: {
          where: { name: "INSTAGRAM" },
          take: 1,
          select: {
            id: true,
            token: true,
            instagramId: true,
            expiresAt: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      integration: user.integrations[0] || null,
    };
  } catch (error) {
    console.error("Auth helper error:", error);
    return null;
  }
}

/**
 * Quick check if user has valid Instagram integration
 */
export function hasValidIntegration(result: AuthResult | null): result is AuthResult & { integration: AuthIntegration } {
  return !!(result?.integration?.token && result.integration.instagramId);
}

