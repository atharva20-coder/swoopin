/**
 * Admin Refund API Route
 * 
 * Process refunds for orders where payment was deducted but not reflected.
 * 
 * POST /api/admin/refund - Create a refund
 * GET /api/admin/refund?orderId=xxx - Get refunds for an order
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { createRefund, getRefundsForOrder, type RefundSpeed } from '@/lib/payments/cashfree/refunds';

// List of admin email addresses
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter((email) => email.length > 0);

async function isAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session?.user) return false;
  return ADMIN_EMAILS.includes(session.user.email.toLowerCase());
}

/**
 * POST /api/admin/refund
 * Create a refund for an order
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, amount, refundNote, refundSpeed = 'STANDARD' } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'orderId and amount are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const result = await createRefund({
      orderId,
      refundAmount: amount,
      refundNote: refundNote || 'Admin initiated refund - payment issue',
      refundSpeed: refundSpeed as RefundSpeed,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create refund' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      refund: {
        refundId: result.refundId,
        cfRefundId: result.cfRefundId,
        orderId: result.orderId,
        amount: result.refundAmount,
        status: result.refundStatus,
        statusDescription: result.statusDescription,
        createdAt: result.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error('Error creating refund:', error);
    const message = error instanceof Error ? error.message : 'Failed to create refund';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/admin/refund?orderId=xxx
 * Get all refunds for an order
 */
export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    const result = await getRefundsForOrder(orderId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch refunds' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      refunds: result.refunds?.map((r) => ({
        refundId: r.refundId,
        cfRefundId: r.cfRefundId,
        amount: r.refundAmount,
        status: r.refundStatus,
        statusDescription: r.statusDescription,
        createdAt: r.createdAt,
        processedAt: r.processedAt,
      })) || [],
    });
  } catch (error: unknown) {
    console.error('Error fetching refunds:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch refunds';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
