import { NextRequest, NextResponse } from 'next/server';
import {
  success,
  unauthorized,
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
 * GET /api/v1/posts/publishing-limit
 * Get Instagram publishing rate limit
 * ============================================
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
      return unauthorized('User not found');
    }

    // 3. Rate limiting
    const rateLimitResponse = await rateLimitByUser(userId, 'standard');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 4. Get publishing limit
    const limit = await schedulerService.getPublishingLimit(userId);

    return success(limit);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('GET /api/v1/posts/publishing-limit error:', error.message);
    }
    return internalError();
  }
}
