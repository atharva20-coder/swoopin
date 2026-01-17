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
 * GET /api/v1/integrations/instagram/oauth
 * Get Instagram OAuth URL for connecting
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Get OAuth URL
    const url = integrationService.getInstagramOAuthUrl();

    if (!url) {
      return internalError("Instagram OAuth not configured");
    }

    return success({ url, platform: "INSTAGRAM" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        "GET /api/v1/integrations/instagram/oauth error:",
        error.message,
      );
    }
    return internalError();
  }
}
