import { NextRequest } from "next/server";
import { requireAuth } from "@/app/api/v1/_lib/middleware";
import { rateLimitByUser } from "@/app/api/v1/_lib/rate-limit";
import { success, error, validationError } from "@/app/api/v1/_lib/response";
import { canvaService } from "@/services/canva.service";
import { GetDesignsRequestSchema } from "@/schemas/canva.schema";

// Force dynamic rendering - this route uses headers for authentication
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/canva/designs
 * Get user's Canva designs
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const rateLimitResponse = await rateLimitByUser(user.id, "standard");
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const validation = GetDesignsRequestSchema.safeParse({
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
      continuation: searchParams.get("continuation"),
    });

    if (!validation.success) {
      return validationError("Invalid request parameters", {
        details: validation.error.errors,
      });
    }

    const designs = await canvaService.getDesigns(user.id, validation.data);

    if ("error" in designs) {
      return error("EXTERNAL_API_ERROR", designs.error, 400);
    }

    return success(designs);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return error("UNAUTHORIZED", "Authentication required", 401);
    }
    console.error("Canva designs GET error:", err);
    return error("INTERNAL_ERROR", "Failed to fetch designs", 500);
  }
}
