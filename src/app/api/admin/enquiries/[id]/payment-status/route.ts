/**
 * Admin Payment Status Check API
 * 
 * Check payment status from Cashfree and update DB.
 * Used for enterprise enquiries.
 * 
 * GET /api/admin/enquiries/[id]/payment-status
 */

import { client } from '@/lib/prisma';
import { getOrderStatus } from '@/lib/payments/cashfree/orders';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

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
 * GET /api/admin/enquiries/[id]/payment-status
 * Check payment status from Cashfree and update DB
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the enquiry
    const enquiry = await client.enterpriseEnquiry.findUnique({
      where: { id: params.id },
    });

    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    if (!enquiry.cashfreeOrderId) {
      return NextResponse.json({
        success: true,
        paymentStatus: enquiry.paymentStatus || 'PENDING',
        message: 'No payment session created yet',
      });
    }

    // Check Cashfree order status
    const orderResult = await getOrderStatus(enquiry.cashfreeOrderId);

    if (!orderResult.success) {
      return NextResponse.json({
        success: false,
        paymentStatus: enquiry.paymentStatus,
        error: orderResult.error,
      });
    }

    let newPaymentStatus = enquiry.paymentStatus;
    let transactionId = enquiry.transactionId;

    if (orderResult.status === 'PAID') {
      newPaymentStatus = 'PAID';
      transactionId = enquiry.cashfreeOrderId;
    } else if (orderResult.status === 'EXPIRED') {
      newPaymentStatus = 'EXPIRED';
    }

    // Update DB if status changed
    if (newPaymentStatus !== enquiry.paymentStatus || transactionId !== enquiry.transactionId) {
      await client.enterpriseEnquiry.update({
        where: { id: params.id },
        data: {
          paymentStatus: newPaymentStatus,
          transactionId: transactionId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      paymentStatus: newPaymentStatus,
      transactionId: transactionId,
      cashfreeStatus: orderResult.status,
    });
  } catch (error) {
    console.error('[Admin Payment Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
