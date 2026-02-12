import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  validationError,
  internalError,
  getAuthUser,
} from "@/app/api/v1/_lib";
import { client } from "@/lib/prisma";
import { EarlyAccessRequestSchema } from "@/schemas/early-access.schema";
import { earlyAccessService } from "@/services/early-access.service";

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
 * POST /api/v1/early-access/request
 * Submit an early-access tester enrollment request
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

    // 3. Parse + validate body
    const body: unknown = await request.json();
    const parsed = EarlyAccessRequestSchema.safeParse(body);

    if (!parsed.success) {
      return validationError("Invalid request data", {
        errors: parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    // 4. Execute service
    const result = await earlyAccessService.createRequest(userId, parsed.data);

    // 5. Respond
    return success(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("POST /api/v1/early-access/request error:", error.message);
    }
    return internalError();
  }
}

/**
 * GET /api/v1/early-access/request
 * Check if user already has an early-access request for Instagram
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

    // 3. Fetch existing request
    const existingRequest = await earlyAccessService.getRequest(
      userId,
      "INSTAGRAM",
    );

    // 4. Respond
    return success({
      hasRequest: !!existingRequest,
      request: existingRequest,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("GET /api/v1/early-access/request error:", error.message);
    }
    return internalError();
  }
}
