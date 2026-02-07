import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  forbidden,
  internalError,
  getAuthUser,
  rateLimitByUser,
} from "@/app/api/v1/_lib";
import { integrationService } from "@/services/integration.service";
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
 * GET /api/v1/integrations/youtube
 * Get YouTube OAuth URL for connecting
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Get OAuth URL
    const url = integrationService.getYouTubeOAuthUrl();

    if (!url) {
      return internalError("YouTube OAuth not configured");
    }

    return success({ url, platform: "YOUTUBE" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("GET /api/v1/integrations/youtube error:", error.message);
    }
    return internalError();
  }
}

/**
 * DELETE /api/v1/integrations/youtube
 * Disconnect YouTube integration
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
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

    // 3. Rate limiting
    const rateLimitResponse = await rateLimitByUser(userId, "standard");
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 4. Get integration ID from query params
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get("id");

    if (!integrationId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Integration ID is required",
            details: {},
          },
        },
        { status: 422 },
      );
    }

    // 5. Disconnect (IDOR check inside service)
    const disconnected = await integrationService.disconnect(
      integrationId,
      userId,
    );

    if (!disconnected) {
      return forbidden("Not authorized to disconnect this integration");
    }

    return success({ disconnected: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        "DELETE /api/v1/integrations/youtube error:",
        error.message,
      );
    }
    return internalError();
  }
}
