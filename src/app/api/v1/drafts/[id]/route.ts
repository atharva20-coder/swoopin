import { NextRequest, NextResponse } from 'next/server';
import {
  success,
  unauthorized,
  forbidden,
  internalError,
  getAuthUser,
  validateBody,
  rateLimitByUser,
} from '@/app/api/v1/_lib';
import { schedulerService } from '@/services/scheduler.service';
import { UpdateDraftRequestSchema } from '@/schemas/scheduler.schema';
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
 * PUT /api/v1/drafts/{id}
 * Update content draft
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
    const validation = await validateBody(request, UpdateDraftRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 6. Update draft (IDOR check inside service)
    const result = await schedulerService.updateDraft(id, userId, validation.data);

    if (!result) {
      return forbidden('Not authorized to update this draft');
    }

    return success(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('PUT /api/v1/drafts/[id] error:', error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * DELETE /api/v1/drafts/{id}
 * Delete content draft
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

    // 5. Delete draft (IDOR check inside service)
    const deleted = await schedulerService.deleteDraft(id, userId);

    if (!deleted) {
      return forbidden('Not authorized to delete this draft');
    }

    return success({ deleted: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('DELETE /api/v1/drafts/[id] error:', error.message);
    }
    return internalError();
  }
}
