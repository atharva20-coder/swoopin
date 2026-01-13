import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { client } from '@/lib/prisma';

/**
 * API Middleware
 * Authentication and authorization helpers for API routes
 */

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
}

/**
 * Get the authenticated user from the session
 * Returns null if not authenticated
 */
export async function getAuthUser(): Promise<AuthenticatedUser | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      emailVerified: session.user.emailVerified,
    };
  } catch {
    return null;
  }
}

/**
 * Require authentication - use in API routes
 * Throws if not authenticated (caller should catch and return unauthorized)
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

/**
 * Get the full database user with relations
 */
export async function getDbUser(userId: string) {
  return client.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      integrations: true,
    },
  });
}

/**
 * Check if user has a specific subscription plan
 */
export async function hasSubscription(
  userId: string,
  requiredPlans: string[] = ['PRO', 'ENTERPRISE']
): Promise<boolean> {
  const user = await client.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user?.subscription) {
    return false;
  }

  return requiredPlans.includes(user.subscription.plan);
}

/**
 * Check if user is an admin
 */
export async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase());
  
  return adminEmails.includes(email.toLowerCase());
}
