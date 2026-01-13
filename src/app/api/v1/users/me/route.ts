import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  success,
  unauthorized,
  notFound,
  internalError,
  getAuthUser,
  validateBody,
} from '../../_lib';
import { client } from '@/lib/prisma';

/**
 * GET /api/v1/users/me
 * Get current authenticated user profile
 */
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // Get full user profile from database
    const profile = await client.user.findUnique({
      where: { email: authUser.email },
      include: {
        subscription: {
          select: {
            plan: true,
            customerId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        integrations: {
          select: {
            id: true,
            name: true,
            instagramId: true,
            expiresAt: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            automations: true,
            notification: true,
          },
        },
      },
    });

    if (!profile) {
      return notFound('User');
    }

    // Check if user is admin
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase());
    const isAdmin = adminEmails.includes(authUser.email.toLowerCase());

    return success({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      createdAt: profile.createdAt,
      subscription: profile.subscription,
      integrations: profile.integrations,
      stats: {
        automationsCount: profile._count.automations,
        unreadNotifications: profile._count.notification,
      },
      isAdmin,
    });
  } catch (error) {
    console.error('GET /api/v1/users/me error:', error);
    return internalError();
  }
}

/**
 * PUT /api/v1/users/me
 * Update current user profile
 */
const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    const data = await validateBody(request, UpdateUserSchema);

    const updated = await client.user.update({
      where: { email: authUser.email },
      data: {
        ...(data.name && { name: data.name }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true,
      },
    });

    return success(updated);
  } catch (error) {
    // Check if it's a validation error response
    if (error instanceof Response) {
      return error;
    }
    console.error('PUT /api/v1/users/me error:', error);
    return internalError();
  }
}
