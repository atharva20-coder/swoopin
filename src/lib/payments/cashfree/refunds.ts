/**
 * Cashfree Refunds API
 * 
 * Create and manage refunds for failed/disputed payments.
 * Note: Refunds can only be initiated within 6 months of original transaction.
 * 
 * Use cases:
 * - Payment deducted but not reflected in app
 * - Payment deducted but subscription not upgraded
 * - Disputed transactions
 * 
 * NOT for: Regular subscription cancellations
 */

import { getCashfreeBaseUrl, getApiHeaders } from './client';

/**
 * Refund status types
 */
export type RefundStatus = 'SUCCESS' | 'PENDING' | 'CANCELLED' | 'ONHOLD' | 'FAILED';

/**
 * Refund speed options
 */
export type RefundSpeed = 'STANDARD' | 'INSTANT';

/**
 * Parameters for creating a refund
 */
export interface CreateRefundParams {
  orderId: string;
  refundAmount: number;
  refundId?: string;  // Optional - will be auto-generated if not provided
  refundNote?: string;
  refundSpeed?: RefundSpeed;
}

/**
 * Refund response from Cashfree
 */
export interface RefundResponse {
  success: boolean;
  refundId?: string;
  cfRefundId?: string;
  orderId?: string;
  refundAmount?: number;
  refundStatus?: RefundStatus;
  statusDescription?: string;
  refundArn?: string;
  createdAt?: string;
  processedAt?: string;
  error?: string;
}

/**
 * Generate unique refund ID
 */
function generateRefundId(orderId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6);
  return `refund_${orderId.substring(0, 15)}_${timestamp}_${random}`.substring(0, 40);
}

/**
 * Create a refund for an order
 * 
 * @param params - Refund creation parameters
 * @returns RefundResponse with refund details
 */
export async function createRefund(params: CreateRefundParams): Promise<RefundResponse> {
  try {
    const { orderId, refundAmount, refundNote, refundSpeed = 'STANDARD' } = params;
    const refundId = params.refundId || generateRefundId(orderId);
    
    const refundRequest = {
      refund_amount: refundAmount,
      refund_id: refundId,
      refund_note: refundNote || 'Refund initiated by admin',
      refund_speed: refundSpeed,
    };
    
    const response = await fetch(
      `${getCashfreeBaseUrl()}/orders/${orderId}/refunds`,
      {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(refundRequest),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('[Cashfree Refund] Creation failed:', data);
      return {
        success: false,
        error: data.message || 'Failed to create refund',
      };
    }
    
    // Handle array response (API returns array with single item)
    const refundData = Array.isArray(data) ? data[0] : data;
    
    return {
      success: true,
      refundId: refundData.refund_id,
      cfRefundId: refundData.cf_refund_id,
      orderId: refundData.order_id,
      refundAmount: refundData.refund_amount,
      refundStatus: refundData.refund_status,
      statusDescription: refundData.status_description,
      refundArn: refundData.refund_arn,
      createdAt: refundData.created_at,
      processedAt: refundData.processed_at,
    };
  } catch (error: unknown) {
    console.error('[Cashfree Refund] Error creating refund:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get refund status by refund ID
 * 
 * @param orderId - The order ID
 * @param refundId - The refund ID
 * @returns RefundResponse with current status
 */
export async function getRefund(orderId: string, refundId: string): Promise<RefundResponse> {
  try {
    const response = await fetch(
      `${getCashfreeBaseUrl()}/orders/${orderId}/refunds/${refundId}`,
      {
        method: 'GET',
        headers: getApiHeaders(),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Refund not found',
      };
    }
    
    return {
      success: true,
      refundId: data.refund_id,
      cfRefundId: data.cf_refund_id,
      orderId: data.order_id,
      refundAmount: data.refund_amount,
      refundStatus: data.refund_status,
      statusDescription: data.status_description,
      refundArn: data.refund_arn,
      createdAt: data.created_at,
      processedAt: data.processed_at,
    };
  } catch (error: unknown) {
    console.error('[Cashfree Refund] Error fetching refund:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get all refunds for an order
 * 
 * @param orderId - The order ID
 * @returns Array of refunds
 */
export async function getRefundsForOrder(orderId: string): Promise<{
  success: boolean;
  refunds?: RefundResponse[];
  error?: string;
}> {
  try {
    const response = await fetch(
      `${getCashfreeBaseUrl()}/orders/${orderId}/refunds`,
      {
        method: 'GET',
        headers: getApiHeaders(),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to fetch refunds',
      };
    }
    
    const refunds = (Array.isArray(data) ? data : []).map((refund: Record<string, unknown>) => ({
      success: true,
      refundId: refund.refund_id as string,
      cfRefundId: refund.cf_refund_id as string,
      orderId: refund.order_id as string,
      refundAmount: refund.refund_amount as number,
      refundStatus: refund.refund_status as RefundStatus,
      statusDescription: refund.status_description as string,
      refundArn: refund.refund_arn as string,
      createdAt: refund.created_at as string,
      processedAt: refund.processed_at as string,
    }));
    
    return { success: true, refunds };
  } catch (error: unknown) {
    console.error('[Cashfree Refund] Error fetching refunds:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Cancel a pending refund
 * 
 * @param orderId - The order ID
 * @param refundId - The refund ID to cancel
 * @param remarks - Optional cancellation remarks
 * @returns RefundResponse
 */
export async function cancelRefund(
  orderId: string,
  refundId: string,
  remarks?: string
): Promise<RefundResponse> {
  try {
    const response = await fetch(
      `${getCashfreeBaseUrl()}/orders/${orderId}/refunds/${refundId}`,
      {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify({
          refund_status: 'CANCELLED',
          remarks: remarks || 'Refund cancelled by admin',
        }),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to cancel refund',
      };
    }
    
    return {
      success: true,
      refundId: data.refund_id,
      cfRefundId: data.cf_refund_id,
      orderId: data.order_id,
      refundAmount: data.refund_amount,
      refundStatus: data.refund_status,
      statusDescription: data.status_description,
    };
  } catch (error: unknown) {
    console.error('[Cashfree Refund] Error cancelling refund:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
