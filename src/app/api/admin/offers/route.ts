/**
 * Admin Offers API Route
 * 
 * Manage promotional offers (discounts, cashback).
 * 
 * POST /api/admin/offers - Create an offer
 * GET /api/admin/offers?offerId=xxx - Get offer details
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { 
  createOffer, 
  createDiscountOffer, 
  createFlatDiscountOffer, 
  getOffer,
  type OfferType,
} from '@/lib/payments/cashfree/offers';

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
 * POST /api/admin/offers
 * Create a promotional offer
 * 
 * Quick modes:
 * - { type: "percentage", code: "SAVE20", percent: 20, maxDiscount: 200 }
 * - { type: "flat", code: "FLAT100", amount: 100 }
 * 
 * Full mode:
 * - { type: "full", ...all offer details }
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Offer code is required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'percentage': {
        const { percent, maxDiscount, validDays = 30, description } = body;
        if (!percent || !maxDiscount) {
          return NextResponse.json(
            { error: 'percent and maxDiscount are required for percentage offers' },
            { status: 400 }
          );
        }
        result = await createDiscountOffer(code, percent, maxDiscount, validDays, description);
        break;
      }
      
      case 'flat': {
        const { amount, validDays = 30, description } = body;
        if (!amount) {
          return NextResponse.json(
            { error: 'amount is required for flat offers' },
            { status: 400 }
          );
        }
        result = await createFlatDiscountOffer(code, amount, validDays, description);
        break;
      }
      
      case 'full': {
        // Full offer creation with all details
        const {
          title,
          description,
          startTime,
          endTime,
          offerType,
          discountDetails,
          cashbackDetails,
          minAmount,
          maxAllowed,
          paymentMethod,
          termsAndConditions,
        } = body;

        if (!title || !offerType) {
          return NextResponse.json(
            { error: 'title and offerType are required for full offers' },
            { status: 400 }
          );
        }

        result = await createOffer({
          code,
          title,
          description: description || title,
          startTime: startTime ? new Date(startTime) : new Date(),
          endTime: endTime ? new Date(endTime) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          offerType: offerType as OfferType,
          discountDetails,
          cashbackDetails,
          minAmount,
          maxAllowed,
          paymentMethod,
          termsAndConditions,
        });
        break;
      }
      
      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: percentage, flat, or full' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create offer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      offer: {
        offerId: result.offerId,
        offerCode: result.offerCode,
        offerStatus: result.offerStatus,
      },
    });
  } catch (error: unknown) {
    console.error('Error creating offer:', error);
    const message = error instanceof Error ? error.message : 'Failed to create offer';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/admin/offers?offerId=xxx
 * Get offer details by ID
 */
export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const offerId = searchParams.get('offerId');

    if (!offerId) {
      return NextResponse.json(
        { error: 'offerId is required' },
        { status: 400 }
      );
    }

    const result = await getOffer(offerId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Offer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      offer: result.offer,
    });
  } catch (error: unknown) {
    console.error('Error fetching offer:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch offer';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
