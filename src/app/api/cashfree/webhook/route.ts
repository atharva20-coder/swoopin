/**
 * Cashfree Webhook Handler
 * 
 * Handles payment webhooks from Cashfree with security verification:
 * - HMAC-SHA256 signature verification
 * - Timestamp validation (reject >5 min old)
 * - Idempotency tracking via PaymentEvent table
 */

import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/prisma';
import { 
  verifyAndParseWebhook, 
  type WebhookPayload 
} from '@/lib/payments/cashfree/webhooks';
import { calculateSubscriptionEndDate } from '@/lib/payments/cashfree/orders';

/**
 * POST /api/cashfree/webhook
 * Handle Cashfree payment webhooks
 */
export async function POST(req: NextRequest) {
  // Get raw body for signature verification
  const rawBody = await req.text();
  
  // Get signature headers
  const signature = req.headers.get('x-webhook-signature');
  const timestamp = req.headers.get('x-webhook-timestamp');
  
  // Validate required headers
  if (!signature || !timestamp) {
    console.error('[Cashfree Webhook] Missing signature or timestamp headers');
    return NextResponse.json(
      { error: 'Missing required headers' },
      { status: 400 }
    );
  }
  
  // Verify signature and parse payload
  const { valid, payload, error } = verifyAndParseWebhook(
    signature,
    rawBody,
    timestamp
  );
  
  if (!valid || !payload) {
    console.error('[Cashfree Webhook] Verification failed:', error);
    return NextResponse.json(
      { error: error || 'Webhook verification failed' },
      { status: 401 }
    );
  }
  
  // Extract event ID for idempotency check
  const eventId = `${payload.type}_${payload.data.order?.order_id}_${timestamp}`;
  
  try {
    // Check if already processed (idempotency)
    const existingEvent = await client.paymentEvent.findUnique({
      where: { eventId },
    });
    
    if (existingEvent?.processed) {
      console.log('[Cashfree Webhook] Event already processed:', eventId);
      return NextResponse.json({ received: true, duplicate: true });
    }
    
    // Store event for idempotency tracking
    await client.paymentEvent.upsert({
      where: { eventId },
      create: {
        eventId,
        eventType: payload.type,
        payload: JSON.parse(JSON.stringify(payload)),
        processed: false,
      },
      update: {},
    });
    
    // Process based on event type
    switch (payload.type) {
      case 'PAYMENT_SUCCESS_WEBHOOK':
        await handlePaymentSuccess(payload);
        break;
        
      case 'PAYMENT_FAILED_WEBHOOK':
        await handlePaymentFailed(payload);
        break;
        
      case 'PAYMENT_USER_DROPPED_WEBHOOK':
        console.log('[Cashfree Webhook] User dropped payment:', payload.data.order?.order_id);
        break;
      
      case 'PAYMENT_LINK_EVENT':
        await handlePaymentLinkEvent(payload);
        break;
      
      case 'REFUND_STATUS_WEBHOOK':
      case 'AUTO_REFUND_STATUS_WEBHOOK':
        await handleRefundEvent(payload);
        break;
        
      default:
        console.log('[Cashfree Webhook] Unhandled event type:', payload.type);
    }
    
    // Mark as processed
    await client.paymentEvent.update({
      where: { eventId },
      data: { processed: true },
    });
    
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Cashfree Webhook] Processing error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(payload: WebhookPayload) {
  const order = payload.data.order;
  const payment = payload.data.payment;
  const customerDetails = payload.data.customer_details;
  
  if (!order || !customerDetails) {
    console.error('[Cashfree Webhook] Missing order or customer data');
    return;
  }
  
  const userId = customerDetails.customer_id;
  const orderTags = order.order_tags || {};
  const plan = orderTags.plan || 'PRO';
  const cycle = (orderTags.cycle || 'monthly') as 'monthly' | 'annual';
  
  console.log(`[Cashfree Webhook] Payment success for user ${userId}, order ${order.order_id}`);
  
  try {
    // Calculate new subscription end date
    const periodEnd = calculateSubscriptionEndDate(cycle, plan as 'PRO');
    
    // Find user's subscription
    const subscription = await client.subscription.findFirst({
      where: {
        OR: [
          ...(userId ? [{ User: { id: userId } }] : []),
          { User: { email: customerDetails.customer_email } },
        ],
      },
    });
    
    if (!subscription) {
      console.error('[Cashfree Webhook] Subscription not found for user:', userId);
      return;
    }
    
    // Update subscription to PRO
    await client.subscription.update({
      where: { id: subscription.id },
      data: {
        plan: 'PRO',
        cashfreeCustomerId: userId,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
    });
    
    // Create notification
    if (subscription.userId) {
      await client.notification.create({
        data: {
          userId: subscription.userId,
          content: `Your ${plan} ${cycle} subscription is now active! Enjoy PRO features until ${periodEnd.toLocaleDateString()}.`,
        },
      });
    }
    
    console.log(`[Cashfree Webhook] Subscription activated for user ${userId} until ${periodEnd.toISOString()}`);
  } catch (err) {
    console.error('[Cashfree Webhook] Error updating subscription:', err);
    throw err;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(payload: WebhookPayload) {
  const order = payload.data.order;
  const customerDetails = payload.data.customer_details;
  
  if (!order || !customerDetails) {
    return;
  }
  
  console.log(`[Cashfree Webhook] Payment failed for order ${order.order_id}`);
  
  try {
    // Find user and send notification
    const user = await client.user.findFirst({
      where: {
        OR: [
          ...(customerDetails.customer_id ? [{ id: customerDetails.customer_id }] : []),
          { email: customerDetails.customer_email },
        ],
      },
    });
    
    if (user) {
      await client.notification.create({
        data: {
          userId: user.id,
          content: 'Your payment could not be processed. Please try again or contact support.',
        },
      });
    }
  } catch (err) {
    console.error('[Cashfree Webhook] Error handling payment failure:', err);
  }
}

/**
 * Handle Payment Link events (for enterprise payments)
 */
async function handlePaymentLinkEvent(payload: WebhookPayload) {
  // Payment Link webhooks have a different structure
  const rawData = payload.data as unknown as {
    link_id?: string;
    link_status?: string;
    link_amount_paid?: string;
    order?: {
      order_id?: string;
      transaction_id?: string;
      transaction_status?: string;
    };
    link_notes?: {
      enquiryId?: string;
      userId?: string;
      type?: string;
    };
  };
  
  const linkId = rawData.link_id;
  const linkStatus = rawData.link_status;
  const linkNotes = rawData.link_notes;
  
  console.log(`[Cashfree Webhook] Payment Link Event: ${linkId} - ${linkStatus}`);
  
  // Only process if this is an enterprise payment
  if (linkNotes?.type !== 'enterprise' || !linkNotes?.enquiryId) {
    console.log('[Cashfree Webhook] Not an enterprise payment, skipping');
    return;
  }
  
  try {
    // Update enterprise enquiry based on status
    if (linkStatus === 'PAID' || linkStatus === 'PARTIALLY_PAID') {
      const transactionId = rawData.order?.transaction_id?.toString();
      
      await client.enterpriseEnquiry.update({
        where: { id: linkNotes.enquiryId },
        data: {
          paymentStatus: linkStatus === 'PAID' ? 'paid' : 'partial',
          transactionId: transactionId || null,
        },
      });
      
      // If fully paid, activate enterprise subscription
      if (linkStatus === 'PAID' && linkNotes.userId) {
        const enquiry = await client.enterpriseEnquiry.findUnique({
          where: { id: linkNotes.enquiryId },
        });
        
        if (enquiry) {
          // Calculate end date (1 year for enterprise)
          const periodEnd = new Date();
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          
          await client.subscription.upsert({
            where: { userId: linkNotes.userId },
            create: {
              userId: linkNotes.userId,
              plan: 'ENTERPRISE',
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: false,
            },
            update: {
              plan: 'ENTERPRISE',
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: false,
            },
          });
          
          // Send notification
          await client.notification.create({
            data: {
              userId: linkNotes.userId,
              content: 'Your Enterprise subscription is now active! Enjoy unlimited access for 1 year.',
            },
          });
          
          console.log(`[Cashfree Webhook] Enterprise subscription activated for user ${linkNotes.userId}`);
        }
      }
    } else if (linkStatus === 'EXPIRED' || linkStatus === 'CANCELLED') {
      await client.enterpriseEnquiry.update({
        where: { id: linkNotes.enquiryId },
        data: {
          paymentStatus: linkStatus.toLowerCase(),
        },
      });
    }
  } catch (err) {
    console.error('[Cashfree Webhook] Error handling payment link event:', err);
  }
}

/**
 * Handle refund events (REFUND_STATUS_WEBHOOK, AUTO_REFUND_STATUS_WEBHOOK)
 */
async function handleRefundEvent(payload: WebhookPayload) {
  // Refund webhooks have different structure
  const rawData = payload.data as unknown as {
    refund?: {
      cf_refund_id?: string;
      cf_payment_id?: string;
      refund_id?: string;
      order_id?: string;
      refund_amount?: number;
      refund_status?: string;
      status_description?: string;
      refund_type?: string;
    };
    auto_refund?: {
      cf_refund_id?: string;
      cf_payment_id?: string;
      order_id?: string;
      refund_amount?: number;
      refund_status?: string;
      refund_reason?: string;
    };
  };
  
  const refundData = rawData.refund || rawData.auto_refund;
  
  if (!refundData) {
    console.log('[Cashfree Webhook] No refund data in payload');
    return;
  }
  
  const isAutoRefund = payload.type === 'AUTO_REFUND_STATUS_WEBHOOK';
  const orderId = refundData.order_id;
  const refundStatus = refundData.refund_status;
  const refundAmount = refundData.refund_amount;
  
  console.log(`[Cashfree Webhook] ${isAutoRefund ? 'Auto-' : ''}Refund event: ${orderId} - ${refundStatus} - ₹${refundAmount}`);
  
  // For auto-refunds (payment issues), we might need to update subscription
  if (isAutoRefund && refundStatus === 'SUCCESS') {
    console.log(`[Cashfree Webhook] Auto-refund processed for order ${orderId}`);
    // Auto-refunds typically happen when payment fails after deduction
    // The subscription should already not be activated in these cases
    // Just log for admin visibility
  }
  
  // For merchant-initiated refunds, log the status
  if (refundStatus === 'SUCCESS') {
    console.log(`[Cashfree Webhook] Refund successful for order ${orderId}`);
  } else if (refundStatus === 'FAILED' || refundStatus === 'CANCELLED') {
    console.log(`[Cashfree Webhook] Refund ${refundStatus.toLowerCase()} for order ${orderId}`);
  }
}
