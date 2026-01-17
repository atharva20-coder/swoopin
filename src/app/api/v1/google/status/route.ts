import { NextRequest } from "next/server";
import { requireAuth } from "@/app/api/v1/_lib/middleware";
import { rateLimitByUser } from "@/app/api/v1/_lib/rate-limit";
import { success, error } from "@/app/api/v1/_lib/response";
import { googleSheetsService } from "@/services/google-sheets.service";

// Force dynamic rendering - this route uses headers for authentication
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/google/status
 * Get Google integration connection status
 */
export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth();

    const rateLimitResponse = await rateLimitByUser(user.id, "standard");
    if (rateLimitResponse) return rateLimitResponse;

    const status = await googleSheetsService.getConnectionStatus(user.id);
    return success(status);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return error("UNAUTHORIZED", "Authentication required", 401);
    }
    console.error("Google status GET error:", err);
    return error("INTERNAL_ERROR", "Failed to get connection status", 500);
  }
}
