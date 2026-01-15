import { NextRequest } from "next/server";
import { requireAuth } from "@/app/api/v1/_lib/middleware";
import { rateLimitByUser } from "@/app/api/v1/_lib/rate-limit";
import { success, error, validationError } from "@/app/api/v1/_lib/response";
import { canvaService } from "@/services/canva.service";
import {
  GetDesignsRequestSchema,
  ExportDesignRequestSchema,
} from "@/schemas/canva.schema";

/**
 * GET /api/v1/canva
 * Get connection status, designs, or OAuth URL
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const rateLimitResponse = await rateLimitByUser(user.id, "standard");
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Check connection status
    if (action === "status") {
      const status = await canvaService.getConnectionStatus(user.id);
      return success(status);
    }

    // Get OAuth connect URL
    if (action === "connect") {
      const result = await canvaService.getConnectUrl();
      if ("error" in result) {
        return error("EXTERNAL_API_ERROR", result.error, 400);
      }
      return success(result);
    }

    // Default: Get designs
    const validation = GetDesignsRequestSchema.safeParse({
      limit: searchParams.get("limit"),
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
    console.error("Canva GET error:", err);
    return error("INTERNAL_ERROR", "Failed to process request", 500);
  }
}

/**
 * POST /api/v1/canva
 * Export a design
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const rateLimitResponse = await rateLimitByUser(user.id, "heavy");
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();

    const validation = ExportDesignRequestSchema.safeParse(body);
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
    console.error("Canva POST error:", err);
    return error("INTERNAL_ERROR", "Failed to export design", 500);
  }
}

/**
 * DELETE /api/v1/canva
 * Disconnect Canva integration
 */
export async function DELETE() {
  try {
    const user = await requireAuth();

    const rateLimitResponse = await rateLimitByUser(user.id, "standard");
    if (rateLimitResponse) return rateLimitResponse;

    const result = await canvaService.disconnect(user.id);
    return success(result);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return error("UNAUTHORIZED", "Authentication required", 401);
    }
    console.error("Canva DELETE error:", err);
    return error("INTERNAL_ERROR", "Failed to disconnect", 500);
  }
}
