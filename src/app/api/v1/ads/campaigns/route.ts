import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  internalError,
  getAuthUser,
  validateBody,
  rateLimitByUser,
} from "@/app/api/v1/_lib";
import { adsService } from "@/services/ads.service";
import {
  CreateCampaignRequestSchema,
  SyncCampaignsRequestSchema,
} from "@/schemas/ads.schema";
import { client } from "@/lib/prisma";

async function getDbUserId(email: string): Promise<string | null> {
  const user = await client.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * GET /api/v1/ads/campaigns - List campaigns
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return unauthorized();

    const userId = await getDbUserId(authUser.email);
    if (!userId) return unauthorized("User not found");

    const rateLimitResponse = await rateLimitByUser(userId, "standard");
    if (rateLimitResponse) return rateLimitResponse;

    const campaigns = await adsService.getCampaigns(userId);
    return success(campaigns);
  } catch (error: unknown) {
    if (error instanceof Error)
      console.error("GET /api/v1/ads/campaigns error:", error.message);
    return internalError();
  }
}

/**
 * POST /api/v1/ads/campaigns - Create campaign
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return unauthorized();

    const userId = await getDbUserId(authUser.email);
    if (!userId) return unauthorized("User not found");

    const rateLimitResponse = await rateLimitByUser(userId, "heavy");
    if (rateLimitResponse) return rateLimitResponse;

    const validation = await validateBody(request, CreateCampaignRequestSchema);
    if (!validation.success) return validation.response;

    const result = await adsService.createCampaign(userId, validation.data);
    if ("error" in result) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "CREATE_FAILED", message: result.error, details: {} },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error)
      console.error("POST /api/v1/ads/campaigns error:", error.message);
    return internalError();
  }
}
