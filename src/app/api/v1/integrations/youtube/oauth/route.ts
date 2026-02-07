import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/api/v1/_lib";
import { integrationService } from "@/services/integration.service";
import { ConnectYouTubeRequestSchema } from "@/schemas/integration.schema";
import { client } from "@/lib/prisma";

/**
 * ============================================
 * YouTube OAuth Callback Route
 * Handles the OAuth redirect from Google
 * ============================================
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Helper to get db user ID from email
 */
async function getDbUserId(email: string): Promise<string | null> {
  const user = await client.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    // 1. Authentication (Gateway Pattern)
    const authUser = await getAuthUser();
    if (!authUser) {
      console.error("[YouTube OAuth] No authenticated user");
      return NextResponse.redirect(
        `${baseUrl}/dashboard/integrations?error=unauthorized`,
      );
    }

    // 2. Get database user ID
    const userId = await getDbUserId(authUser.email);
    if (!userId) {
      console.error(
        "[YouTube OAuth] User not found in database:",
        authUser.email,
      );
      return NextResponse.redirect(
        `${baseUrl}/dashboard/integrations?error=user_not_found`,
      );
    }

    // 3. Extract params from URL
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    console.log("[YouTube OAuth] Callback received:", {
      hasCode: !!code,
      error,
      userId,
    });

    // 4. Handle OAuth denial
    if (error) {
      console.error("[YouTube OAuth] OAuth error:", error);
      return NextResponse.redirect(
        `${baseUrl}/dashboard/integrations?error=access_denied`,
      );
    }

    // 5. Validate code (Zero Patchwork: validate at gateway)
    const validation = ConnectYouTubeRequestSchema.safeParse({ code });

    if (!validation.success) {
      console.error("[YouTube OAuth] Invalid code:", validation.error);
      return NextResponse.redirect(
        `${baseUrl}/dashboard/integrations?error=invalid_code`,
      );
    }

    // 6. Execute service (clean, validated data)
    console.log("[YouTube OAuth] Connecting YouTube for user:", userId);
    const result = await integrationService.connectYouTube(
      userId,
      validation.data.code,
    );

    // 7. Handle response
    if ("error" in result) {
      console.error("[YouTube OAuth] Connection failed:", result.error);
      return NextResponse.redirect(
        `${baseUrl}/dashboard/integrations?error=${encodeURIComponent(result.error)}`,
      );
    }

    console.log("[YouTube OAuth] Successfully connected YouTube");
    // Success - redirect to integrations page
    return NextResponse.redirect(
      `${baseUrl}/dashboard/integrations?success=youtube_connected`,
    );
  } catch (error: unknown) {
    console.error("[YouTube OAuth] Unexpected error:", error);
    return NextResponse.redirect(
      `${baseUrl}/dashboard/integrations?error=internal_error`,
    );
  }
}
