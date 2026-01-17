import { NextRequest } from "next/server";
import { requireAuth } from "@/app/api/v1/_lib/middleware";
import { rateLimitByUser } from "@/app/api/v1/_lib/rate-limit";
import { success, error } from "@/app/api/v1/_lib/response";
import { canvaService } from "@/services/canva.service";

// Force dynamic rendering - this route uses headers for authentication
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/canva/status
 * Get Canva integration connection status
 */
export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth();

    const rateLimitResponse = await rateLimitByUser(user.id, "standard");
    if (rateLimitResponse) return rateLimitResponse;

    const status = await canvaService.getConnectionStatus(user.id);
    return success(status);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return error("UNAUTHORIZED", "Authentication required", 401);
    }
    console.error("Canva status GET error:", err);
    return error("INTERNAL_ERROR", "Failed to get connection status", 500);
  }
}
