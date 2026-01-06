/**
 * Payment API Route
 * 
 * Creates a Cashfree payment order for subscription purchases.
 * Uses dynamic pricing from code (not Cashfree Dashboard).
 * 
 * GET /api/payment?plan=PRO&cycle=monthly
 */

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/rate-limiter';
import { client } from '@/lib/prisma';
import { createPaymentOrder } from '@/lib/payments/cashfree/orders';

export async function GET(req: NextRequest) {
  // Apply rate limiting (API tier - 100 requests/minute)
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

  // Get plan and cycle from query params
  const { searchParams } = new URL(req.url);
  const plan = searchParams.get('plan') || 'PRO';
  const cycle = searchParams.get('cycle') || 'monthly';

  // Validate plan (only PRO supported currently)
  if (plan !== 'PRO') {
    return NextResponse.json({ status: 400, error: 'Invalid plan. Use PRO.' });
  }

  // Validate cycle
  if (cycle !== 'monthly' && cycle !== 'annual') {
    return NextResponse.json({ status: 400, error: 'Invalid cycle. Use monthly or annual.' });
  }

  try {
    // Get user from database
    const dbUser = await client.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!dbUser) {
      return NextResponse.json({ status: 404, error: 'User not found' });
    }

    // Build webhook URL for payment notifications
    const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || process.env.NEXT_PUBLIC_API_URL;
    const returnUrl = `${baseUrl}/payment`;
    const notifyUrl = `${baseUrl}/api/cashfree/webhook`;

    // Create Cashfree payment order
    const orderResult = await createPaymentOrder({
      userId: dbUser.id,
      userEmail: session.user.email,
      userName: session.user.name || undefined,
      plan: plan as 'PRO',
      cycle: cycle as 'monthly' | 'annual',
      returnUrl,
      notifyUrl,
    });

    if (!orderResult.success) {
      console.error('[Payment] Order creation failed:', orderResult.error);
      return NextResponse.json({ 
        status: 500, 
        error: orderResult.error || 'Failed to create payment order' 
      });
    }

    // Return payment session for frontend JS SDK integration
    // Frontend will use: cashfree.checkout({ paymentSessionId })
    return NextResponse.json({
      status: 200,
      payment_session_id: orderResult.paymentSessionId,
      order_id: orderResult.orderId,
      amount: orderResult.amount,
    });
  } catch (error) {
    console.error('[Payment] Error:', error);
    return NextResponse.json({ 
      status: 500, 
      error: 'Failed to initiate payment' 
    });
  }
}
