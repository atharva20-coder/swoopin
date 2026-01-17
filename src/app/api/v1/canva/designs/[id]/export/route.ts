import { NextRequest } from "next/server";
import { requireAuth } from "@/app/api/v1/_lib/middleware";
import { rateLimitByUser } from "@/app/api/v1/_lib/rate-limit";
import { success, error, validationError } from "@/app/api/v1/_lib/response";
import { canvaService } from "@/services/canva.service";
import { ExportDesignRequestSchema } from "@/schemas/canva.schema";

// Force dynamic rendering - this route uses headers for authentication
export const dynamic = "force-dynamic";

/**
 * POST /api/v1/canva/designs/[id]/export
 * Export a Canva design as image
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();

    const rateLimitResponse = await rateLimitByUser(user.id, "heavy");
    if (rateLimitResponse) return rateLimitResponse;

    const { id: designId } = await params;
    const body = await request.json();

    const validation = ExportDesignRequestSchema.safeParse({
      designId,
      format: body.format || "png",
    });

    if (!validation.success) {
      return validationError("Invalid request body", {
        details: validation.error.errors,
      });
    }

    const result = await canvaService.exportDesign(user.id, validation.data);

    if ("error" in result) {
      return error("EXTERNAL_API_ERROR", result.error, 400);
    }

    return success(result);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return error("UNAUTHORIZED", "Authentication required", 401);
    }
    console.error("Canva design export error:", err);
    return error("INTERNAL_ERROR", "Failed to export design", 500);
  }
}
