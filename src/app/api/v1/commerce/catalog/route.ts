import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  notFound,
  internalError,
  getAuthUser,
  validateQuery,
  validateBody,
  rateLimitByUser,
} from "@/app/api/v1/_lib";
import { commerceService } from "@/services/commerce.service";
import {
  ProductsQuerySchema,
  UpdateProductStatusRequestSchema,
} from "@/schemas/commerce.schema";
import { client } from "@/lib/prisma";

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
 * ============================================
 * GET /api/v1/commerce/catalog
 * Get user's product catalog
 * ============================================
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
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

    // 4. Get catalog
    const catalog = await commerceService.getCatalog(userId);

    if (!catalog) {
      return success({ catalog: null, products: [] });
    }

    return success(catalog);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("GET /api/v1/commerce/catalog error:", error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * POST /api/v1/commerce/catalog
 * Sync catalog with Instagram/Meta
 * ============================================
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
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

    // 3. Rate limiting (heavy operation)
    const rateLimitResponse = await rateLimitByUser(userId, "heavy");
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 4. Sync catalog
    const result = await commerceService.syncCatalog(userId);

    if ("error" in result) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SYNC_FAILED",
            message: result.error,
            details: {},
          },
        },
        { status: 400 }
      );
    }

    return success(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("POST /api/v1/commerce/catalog error:", error.message);
    }
    return internalError();
  }
}
