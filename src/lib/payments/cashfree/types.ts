/**
 * Cashfree Payment Types
 * 
 * TypeScript interfaces for Cashfree API responses and internal types.
 */

/**
 * Payment method types supported
 */
export type PaymentMethod = 
  | 'upi'
  | 'cc'      // Credit Card
  | 'dc'      // Debit Card
  | 'nb'      // Net Banking
  | 'app'     // Apps (GPay, PhonePe, Paytm)
  | 'paylater'
  | 'qr';

/**
 * Order status from Cashfree
 */
export type OrderStatus = 
  | 'ACTIVE'
  | 'PAID'
  | 'EXPIRED'
  | 'TERMINATED';

/**
 * Payment status
 */
export type PaymentStatus = 
  | 'SUCCESS'
  | 'FAILED'
  | 'PENDING'
  | 'USER_DROPPED'
  | 'CANCELLED';

/**
 * Customer details for order creation
 */
export interface CustomerDetails {
  customer_id: string;
  customer_email: string;
  customer_phone: string;
  customer_name?: string;
}

/**
 * Order metadata
 */
export interface OrderMeta {
  return_url: string;
  notify_url?: string;
  payment_methods?: string;
}

/**
 * Cashfree order entity
 */
export interface CashfreeOrder {
  cf_order_id: string;
  order_id: string;
  entity: 'order';
  order_currency: string;
  order_amount: number;
  order_status: OrderStatus;
  payment_session_id: string;
  order_expiry_time: string;
  order_note?: string;
  created_at: string;
  order_tags?: Record<string, string>;
  customer_details: CustomerDetails;
  order_meta: OrderMeta;
}

/**
 * Payment entity from Cashfree
 */
export interface CashfreePayment {
  cf_payment_id: string;
  order_id: string;
  payment_status: PaymentStatus;
  payment_amount: number;
  payment_currency: string;
  payment_method: {
    upi?: { upi_id: string };
    card?: { 
      card_network: string;
      card_last4: string;
    };
    netbanking?: { 
      netbanking_bank_name: string;
    };
    app?: { 
      provider: string;
      phone: string;
    };
  };
  payment_time: string;
  bank_reference?: string;
}

/**
 * Subscription record for database
 */
export interface SubscriptionRecord {
  userId: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  cashfreeCustomerId?: string;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
}
