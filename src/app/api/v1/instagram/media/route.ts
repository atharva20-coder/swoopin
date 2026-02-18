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

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/**
 * GET /api/v1/instagram/media
 * Get user's Instagram media posts with cursor-based pagination.
 * Query params: limit (default 50, max 100), after (cursor for next page).
 * Returns { data, meta: { after, hasMore } } for infinite loading.
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
      return success([], { after: undefined, hasMore: false });
    }

    // 5. Parse query params
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(limitParam || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT),
    );
    const after = searchParams.get("after") || undefined;

    // 6. Fetch media from Instagram API with pagination
    try {
      const params: Record<string, string | number> = {
        fields: "id,caption,media_url,media_type,timestamp,thumbnail_url",
        limit,
      };
      if (after) {
        params.after = after;
      }

      const response = await axios.get(
        `${process.env.INSTAGRAM_BASE_URL}/v21.0/${integration.instagramId}/media`,
        {
          params,
          headers: {
            Authorization: `Bearer ${integration.token}`,
          },
          timeout: 20000,
        },
      );

      const rawData = response.data?.data || [];
      const paging = response.data?.paging;
      const nextCursor = paging?.cursors?.after ?? undefined;
      const hasMore = Boolean(paging?.next);

      const posts = rawData.map((post: any) => ({
        id: post.id,
        media_url: post.media_url || post.thumbnail_url || "",
        media_type: post.media_type || "IMAGE",
        caption: post.caption || "",
        timestamp: post.timestamp || new Date().toISOString(),
      }));

      return success(posts, { after: nextCursor, hasMore });
    } catch (igError: any) {
      console.error(
        "[Instagram API Error]",
        igError.response?.data || igError.message,
      );
      return success([], { after: undefined, hasMore: false });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("GET /api/v1/instagram/media error:", error.message);
    }
    return internalError();
  }
}
