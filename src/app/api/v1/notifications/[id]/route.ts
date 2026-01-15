import { NextRequest, NextResponse } from 'next/server';
import {
  success,
  unauthorized,
  forbidden,
  internalError,
  getAuthUser,
  rateLimitByUser,
} from '@/app/api/v1/_lib';
import { notificationService } from '@/services/notification.service';
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
 * PUT /api/v1/notifications/{id}
 * Mark notification as read
 * ============================================
 */
export async function PUT(
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

    // 5. Mark as read (IDOR check inside service)
    const result = await notificationService.markAsRead(id, userId);

    if (!result) {
      return forbidden('Not authorized to modify this notification');
    }

    return success(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('PUT /api/v1/notifications/[id] error:', error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * DELETE /api/v1/notifications/{id}
 * Delete notification
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

    // 5. Delete (IDOR check inside service)
    const deleted = await notificationService.delete(id, userId);

    if (!deleted) {
      return forbidden('Not authorized to delete this notification');
    }

    return success({ deleted: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('DELETE /api/v1/notifications/[id] error:', error.message);
    }
    return internalError();
  }
}
