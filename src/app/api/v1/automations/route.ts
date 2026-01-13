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
import { automationService } from '@/services/automation.service';
import {
  AutomationsPaginationSchema,
  CreateAutomationRequestSchema,
} from '@/schemas/automation.schema';
import { client } from '@/lib/prisma';

/**
 * ============================================
 * GET /api/v1/automations
 * List automations for current user (cursor-based pagination)
 * ============================================
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Rate limiting
    const rateLimitResponse = await rateLimitByUser(authUser.id, 'standard');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 3. Get user ID from database
    const dbUser = await client.user.findUnique({
      where: { email: authUser.email },
      select: { id: true },
    });

    if (!dbUser) {
      return unauthorized('User not found');
    }

    // 4. Validate query params
    const { searchParams } = new URL(request.url);
    const validation = validateQuery(searchParams, AutomationsPaginationSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 5. Fetch automations (IDOR: only user's own)
    const result = await automationService.listByUser(dbUser.id, validation.data);

    return success(result.data, {
      ...result.meta,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('GET /api/v1/automations error:', error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * POST /api/v1/automations
 * Create new automation
 * ============================================
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Rate limiting
    const rateLimitResponse = await rateLimitByUser(authUser.id, 'standard');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 3. Get user ID from database
    const dbUser = await client.user.findUnique({
      where: { email: authUser.email },
      select: { id: true },
    });

    if (!dbUser) {
      return unauthorized('User not found');
    }

    // 4. Validate request body
    const validation = await validateBody(request, CreateAutomationRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 5. Create automation (IDOR: creates for authenticated user)
    const result = await automationService.create(dbUser.id, validation.data);

    if (!result) {
      return internalError('Failed to create automation');
    }

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('POST /api/v1/automations error:', error.message);
    }
    return internalError();
  }
}
