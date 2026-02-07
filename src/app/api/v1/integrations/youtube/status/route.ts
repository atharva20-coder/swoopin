import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  internalError,
  getAuthUser,
} from "@/app/api/v1/_lib";
import { integrationService } from "@/services/integration.service";

// Force dynamic rendering - this route uses headers for authentication
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/integrations/youtube/status
 * Check if YouTube is connected
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Get YouTube integration
    const integration = await integrationService.getByPlatform(
      authUser.id,
      "YOUTUBE",
    );

    return success({
      connected: !!integration,
      integrationId: integration?.id || null,
      channelId: integration?.instagramId || null,
      channelTitle: integration?.name || null,
      expiresAt: integration?.expiresAt || null,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        "GET /api/v1/integrations/youtube/status error:",
        error.message,
      );
    }
    return internalError();
  }
}
