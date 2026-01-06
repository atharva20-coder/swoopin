/**
 * Cancel Subscription API Route
 * 
 * Marks the subscription to not renew at period end.
 * User keeps PRO access until current period ends, then downgrades to FREE.
 * 
 * POST /api/payment/cancel
 */

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/rate-limiter';
import { client } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(req, 'API');
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ status: 401, error: 'Unauthorized' });
  }

  try {
    // Get user's subscription
    const dbUser = await client.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!dbUser?.subscription) {
      return NextResponse.json({
        status: 400,
        error: 'No subscription found',
      });
    }

    const subscription = dbUser.subscription;

    // Check if already on FREE plan
    if (subscription.plan === 'FREE') {
      return NextResponse.json({
        status: 400,
        error: 'You are already on the Free plan',
      });
    }

    // Check if already cancelling
    if (subscription.cancelAtPeriodEnd) {
      return NextResponse.json({
        status: 200,
        message: 'Subscription is already set to cancel',
        endsAt: subscription.currentPeriodEnd?.toISOString(),
      });
    }

    // Get period end date (or set to now if not available)
    const periodEndDate = subscription.currentPeriodEnd || new Date();

    // Mark subscription to cancel at period end
    // User keeps PRO access until period ends
    await client.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        // Keep the current plan - don't change to FREE yet!
        // The plan will be changed to FREE when the period actually ends (via cron)
      },
    });

    // Create notification
    await client.notification.create({
      data: {
        userId: dbUser.id,
        content: `Your subscription will end on ${periodEndDate.toLocaleDateString()}. You'll keep PRO access until then.`,
      },
    });

    return NextResponse.json({
      status: 200,
      message: 'Subscription will be cancelled at end of billing period',
      endsAt: periodEndDate.toISOString(),
    });
  } catch (error) {
    console.error('[Cancel Subscription] Error:', error);
    return NextResponse.json({
      status: 500,
      error: 'Failed to cancel subscription',
    });
  }
}
