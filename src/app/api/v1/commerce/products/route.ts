import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
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
 * GET /api/v1/commerce/products
 * Get products from user's catalog
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

    // 4. Validate query params
    const { searchParams } = new URL(request.url);
    const validation = validateQuery(searchParams, ProductsQuerySchema);
    if (!validation.success) {
      return validation.response;
    }

    // 5. Get products
    const products = await commerceService.getProducts(userId, validation.data);

    return success(products);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("GET /api/v1/commerce/products error:", error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * PUT /api/v1/commerce/products
 * Update product status
 * ============================================
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
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

    // 4. Validate request body
    const validation = await validateBody(
      request,
      UpdateProductStatusRequestSchema
    );
    if (!validation.success) {
      return validation.response;
    }

    // 5. Update product (IDOR check inside service)
    const result = await commerceService.updateProductStatus(
      userId,
      validation.data.productId,
      validation.data.status
    );

    if ("error" in result) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UPDATE_FAILED",
            message: result.error,
            details: {},
          },
        },
        { status: 404 }
      );
    }

    return success(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("PUT /api/v1/commerce/products error:", error.message);
    }
    return internalError();
  }
}
