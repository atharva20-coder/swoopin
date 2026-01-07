/**
 * Cashfree Payment Integration
 * 
 * Modular payment module for handling subscriptions via Cashfree Orders API.
 * Pricing is managed in code (not Cashfree Dashboard) for flexibility.
 */

export { 
  cashfreeClient, 
  getCashfreeClient, 
  getCashfreeBaseUrl, 
  getApiHeaders, 
  getCredentials,
  isProduction 
} from './cashfree/client';

export { 
  createPaymentOrder, 
  getOrderStatus, 
  type CreateOrderParams, 
  type OrderResponse 
} from './cashfree/orders';

export { 
  verifyWebhookSignature, 
  verifyAndParseWebhook,
  type WebhookPayload,
  type WebhookEventType 
} from './cashfree/webhooks';

export { 
  PRICING, 
  getPlanPrice, 
  getPlanPeriodDays, 
  type PlanType, 
  type BillingCycle 
} from './pricing';

export {
  createRefund,
  getRefund,
  getRefundsForOrder,
  cancelRefund,
  type CreateRefundParams,
  type RefundResponse
} from './cashfree/refunds';

export {
  createOffer,
  getOffer,
  createDiscountOffer,
  createFlatDiscountOffer,
  type CreateOfferParams,
  type OfferResponse
} from './cashfree/offers';
