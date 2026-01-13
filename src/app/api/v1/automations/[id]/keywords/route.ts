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
import { automationService } from '@/services/automation.service';
import { SaveKeywordRequestSchema, EditKeywordRequestSchema } from '@/schemas/automation.schema';
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
 * POST /api/v1/automations/{id}/keywords
 * Add keyword to automation
 * ============================================
 */
export async function POST(
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
    const validation = await validateBody(request, SaveKeywordRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 6. Add keyword (IDOR check inside service)
    const added = await automationService.addKeyword(id, userId, validation.data);

    if (!added) {
      return forbidden('Not authorized to modify this automation');
    }

    return NextResponse.json(
      { success: true, data: { message: 'Keyword added' } },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('POST /api/v1/automations/[id]/keywords error:', error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * PUT /api/v1/automations/{id}/keywords
 * Edit keyword
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
    const validation = await validateBody(request, EditKeywordRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 6. Edit keyword (IDOR check inside service)
    const edited = await automationService.editKeyword(id, userId, validation.data);

    if (!edited) {
      return forbidden('Not authorized to modify this automation');
    }

    return success({ message: 'Keyword updated' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('PUT /api/v1/automations/[id]/keywords error:', error.message);
    }
    return internalError();
  }
}
