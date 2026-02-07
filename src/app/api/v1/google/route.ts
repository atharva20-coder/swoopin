import { NextRequest } from "next/server";
import { requireAuth } from "@/app/api/v1/_lib/middleware";
import { rateLimitByUser } from "@/app/api/v1/_lib/rate-limit";
import { success, error } from "@/app/api/v1/_lib/response";
import { googleSheetsService } from "@/services/google-sheets.service";

// Force dynamic rendering - this route uses headers for authentication
export const dynamic = "force-dynamic";

/**
 * DELETE /api/v1/google
 * Disconnect Google Sheets integration
 */
export async function DELETE(_request: NextRequest) {
  try {
    const user = await requireAuth();

    const rateLimitResponse = await rateLimitByUser(user.id, "standard");
    if (rateLimitResponse) return rateLimitResponse;

    // Disconnect Google Sheets
    const result = await googleSheetsService.disconnect(user.id);

    return success({ disconnected: result.disconnected });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return error("UNAUTHORIZED", "Authentication required", 401);
    }
    console.error("Google DELETE error:", err);
    return error("INTERNAL_ERROR", "Failed to disconnect Google", 500);
  }
}
