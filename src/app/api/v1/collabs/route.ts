import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  forbidden,
  internalError,
  getAuthUser,
  validateBody,
  rateLimitByUser,
} from "@/app/api/v1/_lib";
import { collabsService } from "@/services/collabs.service";
import { CreatePartnershipRequestSchema } from "@/schemas/collabs.schema";
import { client } from "@/lib/prisma";

async function getDbUserId(email: string): Promise<string | null> {
  const user = await client.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * GET /api/v1/collabs - List partnerships
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return unauthorized();

    const userId = await getDbUserId(authUser.email);
    if (!userId) return unauthorized("User not found");

    const rateLimitResponse = await rateLimitByUser(userId, "standard");
    if (rateLimitResponse) return rateLimitResponse;

    const partnerships = await collabsService.getPartnerships(userId);
    return success(partnerships);
  } catch (error: unknown) {
    if (error instanceof Error)
      console.error("GET /api/v1/collabs error:", error.message);
    return internalError();
  }
}

/**
 * POST /api/v1/collabs - Create partnership
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return unauthorized();

    const userId = await getDbUserId(authUser.email);
    if (!userId) return unauthorized("User not found");

    const rateLimitResponse = await rateLimitByUser(userId, "standard");
    if (rateLimitResponse) return rateLimitResponse;

    const validation = await validateBody(
      request,
      CreatePartnershipRequestSchema
    );
    if (!validation.success) return validation.response;

    const result = await collabsService.createPartnership(
      userId,
      validation.data
    );
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
      console.error("POST /api/v1/collabs error:", error.message);
    return internalError();
  }
}
