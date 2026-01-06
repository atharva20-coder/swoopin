/**
 * Cashfree Orders API
 * 
 * Create and manage payment orders with dynamic pricing.
 * Uses REST API directly for reliable integration.
 */

import { getCashfreeBaseUrl, getApiHeaders, getApiVersion } from './client';
import { getPlanPrice, getPlanPeriodDays, type PlanType, type BillingCycle } from '../pricing';

/**
 * Parameters for creating a payment order
 */
export interface CreateOrderParams {
  userId: string;
  userEmail: string;
  userName?: string;
  userPhone?: string;
  plan: PlanType;
  cycle: BillingCycle;
  returnUrl: string;
  notifyUrl?: string;
}

/**
 * Response from Cashfree order creation
 */
export interface OrderResponse {
  success: boolean;
  orderId?: string;
  cfOrderId?: string;
  paymentSessionId?: string;
  paymentLink?: string;
  amount?: number;
  error?: string;
}

/**
 * Generate a unique order ID
 */
function generateOrderId(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  // Max 45 chars, alphanumeric with _ and -
  return `order_${userId.substring(0, 8)}_${timestamp}_${random}`;
}

/**
 * Create a payment order for subscription
 * 
 * @param params - Order creation parameters
 * @returns OrderResponse with payment details
 */
export async function createPaymentOrder(params: CreateOrderParams): Promise<OrderResponse> {
  try {
    const { userId, userEmail, userName, userPhone, plan, cycle, returnUrl, notifyUrl } = params;
    
    const orderId = generateOrderId(userId);
    const amount = getPlanPrice(plan, cycle);
    
    // Build customer details
    const customerDetails: Record<string, string> = {
      customer_id: userId.substring(0, 50), // Max 50 chars
      customer_email: userEmail,
    };
    
    if (userName) {
      customerDetails.customer_name = userName;
    }
    
    // Cashfree requires phone (10 digits)
    customerDetails.customer_phone = userPhone?.replace(/\D/g, '').slice(-10) || '9999999999';
    
    // Build order meta
    const orderMeta: Record<string, unknown> = {
      return_url: `${returnUrl}?order_id={order_id}`,
      // Enable all payment methods: UPI, Cards, NetBanking, Apps
      payment_methods: 'upi,cc,dc,nb,app,paylater',
    };
    
    if (notifyUrl) {
      orderMeta.notify_url = notifyUrl;
    }
    
    // Order expiry: 30 minutes from now
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 30);
    
    const orderRequest = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: customerDetails,
      order_meta: orderMeta,
      order_expiry_time: expiryTime.toISOString(),
      order_note: `${plan} ${cycle} subscription`,
      order_tags: {
        plan: plan,
        cycle: cycle,
        userId: userId.substring(0, 50),
      },
    };
    
    // Make API call
    const response = await fetch(`${getCashfreeBaseUrl()}/orders`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(orderRequest),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('[Cashfree] Order creation failed:', data);
      return {
        success: false,
        error: data.message || 'Failed to create order',
      };
    }
    
    // Return payment_session_id for frontend JS SDK integration
    // The frontend will use Cashfree JS SDK: cashfree.checkout({ paymentSessionId })
    
    return {
      success: true,
      orderId: data.order_id,
      cfOrderId: data.cf_order_id,
      paymentSessionId: data.payment_session_id,
      amount,
    };
  } catch (error: unknown) {
    console.error('[Cashfree] Error creating order:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get order status from Cashfree
 * 
 * @param orderId - The order ID to check
 * @returns Order status details
 */
export async function getOrderStatus(orderId: string): Promise<{
  success: boolean;
  status?: string;
  paymentStatus?: string;
  amount?: number;
  error?: string;
}> {
  try {
    const response = await fetch(`${getCashfreeBaseUrl()}/orders/${orderId}`, {
      method: 'GET',
      headers: getApiHeaders(),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Order not found',
      };
    }
    
    return {
      success: true,
      status: data.order_status,
      paymentStatus: data.order_status === 'PAID' ? 'paid' : 'pending',
      amount: data.order_amount,
    };
  } catch (error: unknown) {
    console.error('[Cashfree] Error fetching order:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Calculate subscription end date based on plan cycle
 */
export function calculateSubscriptionEndDate(cycle: BillingCycle, plan: PlanType = 'PRO'): Date {
  const days = getPlanPeriodDays(plan, cycle);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  return endDate;
}
