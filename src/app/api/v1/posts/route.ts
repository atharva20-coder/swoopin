import { NextRequest, NextResponse } from 'next/server';
import {
  success,
  unauthorized,
  internalError,
  getAuthUser,
  validateBody,
  validateQuery,
  rateLimitByUser,
} from '@/app/api/v1/_lib';
import { schedulerService } from '@/services/scheduler.service';
import {
  ScheduledPostsQuerySchema,
  CreateScheduledPostRequestSchema,
} from '@/schemas/scheduler.schema';
import { client } from '@/lib/prisma';

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
 * GET /api/v1/posts
 * List scheduled posts (cursor-based pagination)
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
      return unauthorized('User not found');
    }

    // 3. Rate limiting
    const rateLimitResponse = await rateLimitByUser(userId, 'standard');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 4. Validate query params
    const { searchParams } = new URL(request.url);
    const validation = validateQuery(searchParams, ScheduledPostsQuerySchema);
    if (!validation.success) {
      return validation.response;
    }

    // 5. Fetch posts
    const result = await schedulerService.listPosts(userId, validation.data);

    return success(result.data, result.meta);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('GET /api/v1/posts error:', error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * POST /api/v1/posts
 * Create scheduled post
 * ============================================
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
      return unauthorized('User not found');
    }

    // 3. Rate limiting
    const rateLimitResponse = await rateLimitByUser(userId, 'standard');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 4. Validate request body
    const validation = await validateBody(request, CreateScheduledPostRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 5. Create post
    const result = await schedulerService.createPost(userId, validation.data);

    if (!result) {
      return internalError('Failed to create scheduled post');
    }

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('POST /api/v1/posts error:', error.message);
    }
    return internalError();
  }
}
