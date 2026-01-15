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
import { integrationService } from '@/services/integration.service';
import { ConnectInstagramRequestSchema } from '@/schemas/integration.schema';
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
 * GET /api/v1/integrations/instagram
 * Get Instagram OAuth URL
 * ============================================
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Get OAuth URL
    const url = integrationService.getInstagramOAuthUrl();

    if (!url) {
      return internalError('Instagram OAuth not configured');
    }

    return success({ url, platform: 'INSTAGRAM' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('GET /api/v1/integrations/instagram error:', error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * POST /api/v1/integrations/instagram
 * Connect Instagram using OAuth code
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

    // 3. Rate limiting (heavy operation)
    const rateLimitResponse = await rateLimitByUser(userId, 'heavy');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 4. Validate request body
    const validation = await validateBody(request, ConnectInstagramRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 5. Connect Instagram
    const result = await integrationService.connectInstagram(userId, validation.data.code);

    if ('error' in result) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTEGRATION_FAILED',
            message: result.error,
            details: {},
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('POST /api/v1/integrations/instagram error:', error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * DELETE /api/v1/integrations/instagram
 * Disconnect Instagram
 * ============================================
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
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

    // 4. Get integration ID from query params
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('id');

    if (!integrationId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Integration ID is required',
            details: {},
          },
        },
        { status: 422 }
      );
    }

    // 5. Disconnect (IDOR check inside service)
    const disconnected = await integrationService.disconnect(integrationId, userId);

    if (!disconnected) {
      return forbidden('Not authorized to disconnect this integration');
    }

    return success({ disconnected: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('DELETE /api/v1/integrations/instagram error:', error.message);
    }
    return internalError();
  }
}
