import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  internalError,
  getAuthUser,
  validateBody,
  rateLimitByUser,
} from "@/app/api/v1/_lib";
import { dataHubService } from "@/services/data-hub.service";
import { CreateCollectionRequestSchema } from "@/schemas/data-hub.schema";
import { client } from "@/lib/prisma";

async function getDbUserId(email: string): Promise<string | null> {
  const user = await client.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * GET /api/v1/data-hub/collections - List collections
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return unauthorized();

    const userId = await getDbUserId(authUser.email);
    if (!userId) return unauthorized("User not found");

    const rateLimitResponse = await rateLimitByUser(userId, "standard");
    if (rateLimitResponse) return rateLimitResponse;

    const collections = await dataHubService.getCollections(userId);
    return success(collections);
  } catch (error: unknown) {
    if (error instanceof Error)
      console.error("GET /api/v1/data-hub/collections error:", error.message);
    return internalError();
  }
}

/**
 * POST /api/v1/data-hub/collections - Create collection
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
      CreateCollectionRequestSchema
    );
    if (!validation.success) return validation.response;

    const result = await dataHubService.createCollection(
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
      console.error("POST /api/v1/data-hub/collections error:", error.message);
    return internalError();
  }
}
