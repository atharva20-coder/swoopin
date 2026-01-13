import { NextRequest, NextResponse } from 'next/server';
import {
  success,
  unauthorized,
  forbidden,
  internalError,
  getAuthUser,
  rateLimitByUser,
} from '@/app/api/v1/_lib';
import { schedulerService } from '@/services/scheduler.service';
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
 * POST /api/v1/posts/{id}/publish
 * Publish scheduled post to Instagram immediately
 * ============================================
 */
export async function POST(
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

    // 4. Rate limiting (heavy operation)
    const rateLimitResponse = await rateLimitByUser(userId, 'heavy');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 5. Publish post (IDOR check inside service)
    const result = await schedulerService.publishPost(id, userId);

    if (!result.success) {
      if (result.error === 'Post not found') {
        return forbidden('Not authorized to publish this post');
      }
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PUBLISH_FAILED',
            message: result.error || 'Failed to publish',
            details: {},
          },
        },
        { status: 400 }
      );
    }

    return success({ message: 'Post published successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('POST /api/v1/posts/[id]/publish error:', error.message);
    }
    return internalError();
  }
}
