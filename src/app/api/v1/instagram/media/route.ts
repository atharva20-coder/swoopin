import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  internalError,
  getAuthUser,
  rateLimitByUser,
} from "@/app/api/v1/_lib";
import { client } from "@/lib/prisma";
import axios from "axios";

// Force dynamic rendering
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
 * GET /api/v1/instagram/media
 * Get user's Instagram media posts
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

    // 3. Rate limiting
    const rateLimitResponse = await rateLimitByUser(userId, "standard");
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 4. Get Instagram integration
    const integration = await client.integrations.findFirst({
      where: {
        userId,
        name: "INSTAGRAM",
      },
      select: {
        token: true,
        instagramId: true,
      },
    });

    if (!integration?.token || !integration?.instagramId) {
      return success([]); // Return empty array if not connected
    }

    // 5. Fetch media from Instagram API
    try {
      const response = await axios.get(
        `${process.env.INSTAGRAM_BASE_URL}/v21.0/${integration.instagramId}/media`,
        {
          params: {
            fields: "id,caption,media_url,media_type,timestamp,thumbnail_url",
            limit: 25,
          },
          headers: {
            Authorization: `Bearer ${integration.token}`,
          },
          timeout: 15000,
        },
      );

      const posts = (response.data.data || []).map((post: any) => ({
        id: post.id,
        media_url: post.media_url || post.thumbnail_url || "",
        media_type: post.media_type || "IMAGE",
        caption: post.caption || "",
        timestamp: post.timestamp || new Date().toISOString(),
      }));

      return success(posts);
    } catch (igError: any) {
      // Handle Instagram API errors gracefully
      console.error(
        "[Instagram API Error]",
        igError.response?.data || igError.message,
      );
      return success([]); // Return empty array on API error
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("GET /api/v1/instagram/media error:", error.message);
    }
    return internalError();
  }
}
