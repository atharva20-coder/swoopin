import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  internalError,
  getAuthUser,
} from "@/app/api/v1/_lib";
import { client } from "@/lib/prisma";

// Force dynamic rendering - this route uses headers for authentication
export const dynamic = "force-dynamic";

/**
 * Helper to get db user ID
 */
async function getDbUserId(email: string): Promise<string | null> {
  const user = await client.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * GET /api/v1/integrations/instagram/status
 * Get Instagram connection status
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Get user ID
    const userId = await getDbUserId(authUser.email);
    if (!userId) {
      return unauthorized("User not found");
    }

    // 3. Check if Instagram integration exists
    const integration = await client.integrations.findFirst({
      where: {
        userId,
        name: "INSTAGRAM",
      },
      select: {
        id: true,
        instagramId: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    if (!integration) {
      return success({
        connected: false,
        instagramId: null,
        expiresAt: null,
      });
    }

    return success({
      connected: true,
      integrationId: integration.id,
      instagramId: integration.instagramId,
      expiresAt: integration.expiresAt,
      createdAt: integration.createdAt,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        "GET /api/v1/integrations/instagram/status error:",
        error.message,
      );
    }
    return internalError();
  }
}
