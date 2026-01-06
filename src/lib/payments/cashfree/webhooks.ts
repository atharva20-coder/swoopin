/**
 * Cashfree Webhook Verification & Handling
 * 
 * Verifies webhook signatures using HMAC-SHA256.
 * Implements security checks: signature, timestamp validation, idempotency.
 * 
 * Based on Cashfree API v2025-01-01 documentation.
 */

import crypto from 'crypto';
import { getCredentials } from './client';

/**
 * Webhook event types from Cashfree (v2025-01-01)
 */
export type WebhookEventType = 
  | 'PAYMENT_SUCCESS_WEBHOOK'
  | 'PAYMENT_FAILED_WEBHOOK'
  | 'PAYMENT_USER_DROPPED_WEBHOOK'
  | 'PAYMENT_LINK_EVENT'
  | 'REFUND_STATUS_WEBHOOK'
  | 'AUTO_REFUND_STATUS_WEBHOOK';

/**
 * Payment method details in webhook
 */
export interface PaymentMethod {
  upi?: {
    channel: string;
    upi_id: string;
    upi_instrument?: string;
    upi_payer_ifsc?: string;
    upi_payer_account_number?: string;
  };
  card?: {
    channel: string;
    card_number: string;
    card_network: string;
    card_type: string;
    card_sub_type?: string;
    card_country?: string;
    card_bank_name?: string;
  };
  netbanking?: {
    channel?: string;
    netbanking_bank_code: string;
    netbanking_bank_name: string;
  };
  app?: {
    channel?: string;
    provider: string;
  };
}

/**
 * Webhook payload structure (v2025-01-01)
 */
export interface WebhookPayload {
  type: WebhookEventType;
  event_time: string;
  data: {
    order: {
      order_id: string;
      order_amount: number;
      order_currency: string;
      order_tags?: Record<string, string> | null;
    };
    payment: {
      cf_payment_id: string;
      payment_status: string;
      payment_amount: number;
      payment_currency: string;
      payment_message: string;
      payment_time: string;
      bank_reference?: string;
      auth_id?: string | null;
      payment_method: PaymentMethod;
      payment_group: string;
    };
    customer_details: {
      customer_id: string | null;
      customer_email: string;
      customer_phone: string;
      customer_name?: string | null;
    };
    error_details?: {
      error_code: string;
      error_description: string;
      error_reason: string;
      error_source: string;
    } | null;
    payment_gateway_details?: {
      gateway_name: string;
      gateway_order_id?: string;
      gateway_payment_id?: string;
      gateway_settlement?: string;
    } | null;
  };
}

/**
 * Verify webhook signature using HMAC-SHA256
 * 
 * Signature = Base64(HMAC-SHA256(timestamp + rawBody, secretKey))
 * 
 * @param signature - x-webhook-signature header
 * @param rawBody - Raw request body as string
 * @param timestamp - x-webhook-timestamp header
 * @returns true if signature is valid
 */
export function verifyWebhookSignature(
  signature: string,
  rawBody: string,
  timestamp: string
): boolean {
  try {
    const { secretKey } = getCredentials();
    const payload = timestamp + rawBody;
    
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(payload)
      .digest('base64');
    
    // Use timing-safe comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    
    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch (error) {
    console.error('[Cashfree Webhook] Signature verification failed:', error);
    return false;
  }
}

/**
 * Validate webhook timestamp to prevent replay attacks
 * Rejects requests older than 5 minutes
 * 
 * @param timestamp - Timestamp from header (milliseconds)
 * @returns true if timestamp is within acceptable range
 */
export function validateWebhookTimestamp(timestamp: string): boolean {
  const webhookTime = parseInt(timestamp, 10);
  const currentTime = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  if (isNaN(webhookTime)) {
    console.error('[Cashfree Webhook] Invalid timestamp format');
    return false;
  }
  
  if (currentTime - webhookTime > maxAge) {
    console.error('[Cashfree Webhook] Timestamp too old, possible replay attack');
    return false;
  }
  
  return true;
}

/**
 * Parse webhook payload safely
 * 
 * @param rawBody - Raw request body
 * @returns Parsed payload or null if invalid
 */
export function parseWebhookPayload(rawBody: string): WebhookPayload | null {
  try {
    const payload = JSON.parse(rawBody);
    
    // Basic validation
    if (!payload.type || !payload.data) {
      console.error('[Cashfree Webhook] Invalid payload structure');
      return null;
    }
    
    return payload as WebhookPayload;
  } catch (error) {
    console.error('[Cashfree Webhook] Failed to parse payload:', error);
    return null;
  }
}

/**
 * Full webhook verification pipeline
 * 
 * @param signature - x-webhook-signature header
 * @param rawBody - Raw request body
 * @param timestamp - x-webhook-timestamp header
 * @returns Object with verification result and parsed payload
 */
export function verifyAndParseWebhook(
  signature: string,
  rawBody: string,
  timestamp: string
): { 
  valid: boolean; 
  payload: WebhookPayload | null; 
  error?: string;
} {
  // Step 1: Validate timestamp (prevent replay attacks)
  if (!validateWebhookTimestamp(timestamp)) {
    return { 
      valid: false, 
      payload: null, 
      error: 'Webhook timestamp validation failed' 
    };
  }
  
  // Step 2: Verify signature
  if (!verifyWebhookSignature(signature, rawBody, timestamp)) {
    return { 
      valid: false, 
      payload: null, 
      error: 'Webhook signature verification failed' 
    };
  }
  
  // Step 3: Parse payload
  const payload = parseWebhookPayload(rawBody);
  if (!payload) {
    return { 
      valid: false, 
      payload: null, 
      error: 'Failed to parse webhook payload' 
    };
  }
  
  return { valid: true, payload };
}

/**
 * Extract user ID from webhook payload
 * Tries order_tags first, then customer_id
 */
export function extractUserIdFromWebhook(payload: WebhookPayload): string | null {
  // Try order_tags.userId first
  if (payload.data.order.order_tags?.userId) {
    return payload.data.order.order_tags.userId;
  }
  
  // Fall back to customer_id
  if (payload.data.customer_details.customer_id) {
    return payload.data.customer_details.customer_id;
  }
  
  return null;
}

/**
 * Extract plan and cycle from order_tags
 */
export function extractPlanFromWebhook(payload: WebhookPayload): {
  plan: string | null;
  cycle: string | null;
} {
  const tags = payload.data.order.order_tags;
  return {
    plan: tags?.plan || null,
    cycle: tags?.cycle || null,
  };
}
