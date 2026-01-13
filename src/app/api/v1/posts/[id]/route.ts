import { NextRequest, NextResponse } from 'next/server';
import {
  success,
  unauthorized,
  notFound,
  forbidden,
  internalError,
  getAuthUser,
  validateBody,
  rateLimitByUser,
} from '@/app/api/v1/_lib';
import { schedulerService } from '@/services/scheduler.service';
import { UpdateScheduledPostRequestSchema } from '@/schemas/scheduler.schema';
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
 * GET /api/v1/posts/{id}
 * Get scheduled post details
 * ============================================
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Await params (Next.js 15)
    const { id } = await params;

    // 3. Get user ID
    const userId = await getDbUserId(authUser.email);
    if (!userId) {
      return unauthorized('User not found');
    }

    // 4. Rate limiting
    const rateLimitResponse = await rateLimitByUser(userId, 'standard');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 5. Get post (IDOR check inside service)
    const post = await schedulerService.getPostById(id, userId);

    if (!post) {
      return notFound('Scheduled post');
    }

    return success(post);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('GET /api/v1/posts/[id] error:', error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * PUT /api/v1/posts/{id}
 * Update scheduled post
 * ============================================
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Await params (Next.js 15)
    const { id } = await params;

    // 3. Get user ID
    const userId = await getDbUserId(authUser.email);
    if (!userId) {
      return unauthorized('User not found');
    }

    // 4. Rate limiting
    const rateLimitResponse = await rateLimitByUser(userId, 'standard');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 5. Validate request body
    const validation = await validateBody(request, UpdateScheduledPostRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 6. Update post (IDOR check inside service)
    const result = await schedulerService.updatePost(id, userId, validation.data);

    if (!result) {
      return forbidden('Not authorized to update this post');
    }

    return success(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('PUT /api/v1/posts/[id] error:', error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * DELETE /api/v1/posts/{id}
 * Delete scheduled post
 * ============================================
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Await params (Next.js 15)
    const { id } = await params;

    // 3. Get user ID
    const userId = await getDbUserId(authUser.email);
    if (!userId) {
      return unauthorized('User not found');
    }

    // 4. Rate limiting
    const rateLimitResponse = await rateLimitByUser(userId, 'standard');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 5. Delete post (IDOR check inside service)
    const deleted = await schedulerService.deletePost(id, userId);

    if (!deleted) {
      return forbidden('Not authorized to delete this post');
    }

    return success({ deleted: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('DELETE /api/v1/posts/[id] error:', error.message);
    }
    return internalError();
  }
}
