/**
 * Cashfree Offers API
 * 
 * Create and manage promotional offers (discounts, cashback).
 * Offers can be applied to orders during checkout.
 * 
 * Offer Types:
 * - DISCOUNT: Percentage or flat discount
 * - CASHBACK: Percentage or flat cashback
 * - DISCOUNT_AND_CASHBACK: Both combined
 * - NO_COST_EMI: No-cost EMI offers
 */

import { getCashfreeBaseUrl, getApiHeaders } from './client';

/**
 * Offer types
 */
export type OfferType = 'DISCOUNT' | 'CASHBACK' | 'DISCOUNT_AND_CASHBACK' | 'NO_COST_EMI';

/**
 * Discount/Cashback type
 */
export type ValueType = 'percentage' | 'flat';

/**
 * Discount details
 */
export interface DiscountDetails {
  discountType: ValueType;
  discountValue: string;
  maxDiscountAmount: string;
}

/**
 * Cashback details
 */
export interface CashbackDetails {
  cashbackType: ValueType;
  cashbackValue: string;
  maxCashbackAmount: string;
}

/**
 * Payment method validation for offers
 */
export interface PaymentMethodValidation {
  card?: {
    type?: ('cc' | 'dc')[];  // Credit card, Debit card
    bankName?: string;
    schemeName?: ('visa' | 'mastercard' | 'rupay' | 'amex')[];
  };
  upi?: {
    app?: string;
  };
  wallet?: {
    issuer?: string;
  };
  netbanking?: {
    bankName?: string;
  };
  app?: {
    provider?: string;
  };
}

/**
 * Parameters for creating an offer
 */
export interface CreateOfferParams {
  code: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  offerType: OfferType;
  discountDetails?: DiscountDetails;
  cashbackDetails?: CashbackDetails;
  minAmount?: number;
  maxAllowed?: number;  // Max times this offer can be used
  paymentMethod?: PaymentMethodValidation;
  termsAndConditions?: string;
}

/**
 * Offer response
 */
export interface OfferResponse {
  success: boolean;
  offerId?: string;
  offerStatus?: string;
  offerCode?: string;
  error?: string;
}

/**
 * Create a promotional offer
 * 
 * @param params - Offer creation parameters
 * @returns OfferResponse
 */
export async function createOffer(params: CreateOfferParams): Promise<OfferResponse> {
  try {
    const {
      code,
      title,
      description,
      startTime,
      endTime,
      offerType,
      discountDetails,
      cashbackDetails,
      minAmount = 1,
      maxAllowed = 1000,
      paymentMethod,
      termsAndConditions = 'Standard terms and conditions apply.',
    } = params;
    
    // Build offer details
    const offerDetails: Record<string, unknown> = {
      offer_type: offerType,
    };
    
    if (discountDetails) {
      offerDetails.discount_details = {
        discount_type: discountDetails.discountType,
        discount_value: discountDetails.discountValue,
        max_discount_amount: discountDetails.maxDiscountAmount,
      };
    }
    
    if (cashbackDetails) {
      offerDetails.cashback_details = {
        cashback_type: cashbackDetails.cashbackType,
        cashback_value: cashbackDetails.cashbackValue,
        max_cashback_amount: cashbackDetails.maxCashbackAmount,
      };
    }
    
    // Build payment method validation
    const paymentMethodValidation: Record<string, unknown> = {};
    if (paymentMethod?.card) {
      paymentMethodValidation.card = {
        type: paymentMethod.card.type,
        bank_name: paymentMethod.card.bankName,
        scheme_name: paymentMethod.card.schemeName,
      };
    }
    if (paymentMethod?.upi) {
      paymentMethodValidation.upi = paymentMethod.upi;
    }
    if (paymentMethod?.wallet) {
      paymentMethodValidation.wallet = paymentMethod.wallet;
    }
    if (paymentMethod?.netbanking) {
      paymentMethodValidation.netbanking = {
        bank_name: paymentMethod.netbanking.bankName,
      };
    }
    
    const offerRequest = {
      offer_meta: {
        offer_title: title,
        offer_description: description,
        offer_code: code.toUpperCase(),
        offer_start_time: startTime.toISOString(),
        offer_end_time: endTime.toISOString(),
      },
      offer_tnc: {
        offer_tnc_type: 'text',
        offer_tnc_value: termsAndConditions,
      },
      offer_details: offerDetails,
      offer_validations: {
        min_amount: minAmount,
        max_allowed: maxAllowed,
        ...(Object.keys(paymentMethodValidation).length > 0 && {
          payment_method: paymentMethodValidation,
        }),
      },
    };
    
    const response = await fetch(`${getCashfreeBaseUrl()}/offers`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(offerRequest),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('[Cashfree Offers] Creation failed:', data);
      return {
        success: false,
        error: data.message || 'Failed to create offer',
      };
    }
    
    return {
      success: true,
      offerId: data.offer_id,
      offerStatus: data.offer_status,
      offerCode: data.offer_meta?.offer_code,
    };
  } catch (error: unknown) {
    console.error('[Cashfree Offers] Error creating offer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get offer by ID
 * 
 * @param offerId - The offer ID
 * @returns Offer details
 */
export async function getOffer(offerId: string): Promise<{
  success: boolean;
  offer?: {
    offerId: string;
    offerStatus: string;
    offerCode: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    offerType: string;
    discountDetails?: Record<string, string>;
    cashbackDetails?: Record<string, string>;
    minAmount?: number;
    maxAllowed?: number;
  };
  error?: string;
}> {
  try {
    const response = await fetch(`${getCashfreeBaseUrl()}/offers/${offerId}`, {
      method: 'GET',
      headers: getApiHeaders(),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Offer not found',
      };
    }
    
    return {
      success: true,
      offer: {
        offerId: data.offer_id,
        offerStatus: data.offer_status,
        offerCode: data.offer_meta?.offer_code,
        title: data.offer_meta?.offer_title,
        description: data.offer_meta?.offer_description,
        startTime: data.offer_meta?.offer_start_time,
        endTime: data.offer_meta?.offer_end_time,
        offerType: data.offer_details?.offer_type,
        discountDetails: data.offer_details?.discount_details,
        cashbackDetails: data.offer_details?.cashback_details,
        minAmount: data.offer_validations?.min_amount,
        maxAllowed: data.offer_validations?.max_allowed,
      },
    };
  } catch (error: unknown) {
    console.error('[Cashfree Offers] Error fetching offer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Helper: Create a simple percentage discount offer
 */
export async function createDiscountOffer(
  code: string,
  discountPercent: number,
  maxDiscount: number,
  validDays: number = 30,
  description?: string
): Promise<OfferResponse> {
  const startTime = new Date();
  const endTime = new Date();
  endTime.setDate(endTime.getDate() + validDays);
  
  return createOffer({
    code,
    title: `${discountPercent}% Off`,
    description: description || `Get ${discountPercent}% off on your subscription! Max discount: ₹${maxDiscount}`,
    startTime,
    endTime,
    offerType: 'DISCOUNT',
    discountDetails: {
      discountType: 'percentage',
      discountValue: discountPercent.toString(),
      maxDiscountAmount: maxDiscount.toString(),
    },
    minAmount: 100,
    maxAllowed: 1000,
  });
}

/**
 * Helper: Create a flat discount offer
 */
export async function createFlatDiscountOffer(
  code: string,
  discountAmount: number,
  validDays: number = 30,
  description?: string
): Promise<OfferResponse> {
  const startTime = new Date();
  const endTime = new Date();
  endTime.setDate(endTime.getDate() + validDays);
  
  return createOffer({
    code,
    title: `₹${discountAmount} Off`,
    description: description || `Get flat ₹${discountAmount} off on your subscription!`,
    startTime,
    endTime,
    offerType: 'DISCOUNT',
    discountDetails: {
      discountType: 'flat',
      discountValue: discountAmount.toString(),
      maxDiscountAmount: discountAmount.toString(),
    },
    minAmount: discountAmount + 1,
    maxAllowed: 1000,
  });
}
