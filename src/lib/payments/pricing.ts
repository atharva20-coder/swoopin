/**
 * Dynamic Pricing Configuration
 * 
 * All plan pricing is managed here in code.
 * Change prices anytime without Cashfree Dashboard reconfiguration.
 */

export type PlanType = 'PRO';
export type BillingCycle = 'monthly' | 'annual';

interface PricingConfig {
  amount: number;      // Amount in INR (paise not needed, Cashfree takes rupees)
  periodDays: number;  // Subscription period in days
  label: string;       // Display label
}

/**
 * Pricing configuration for all plans
 * Amounts are in INR (Rupees)
 */
export const PRICING: Record<PlanType, Record<BillingCycle, PricingConfig>> = {
  PRO: {
    monthly: {
      amount: 999,
      periodDays: 30,
      label: 'Pro Monthly',
    },
    annual: {
      amount: 9990,
      periodDays: 365,
      label: 'Pro Annual',
    },
  },
} as const;

/**
 * Get the price for a specific plan and billing cycle
 */
export function getPlanPrice(plan: PlanType, cycle: BillingCycle): number {
  return PRICING[plan][cycle].amount;
}

/**
 * Get the subscription period in days for a specific plan and billing cycle
 */
export function getPlanPeriodDays(plan: PlanType, cycle: BillingCycle): number {
  return PRICING[plan][cycle].periodDays;
}

/**
 * Get the display label for a plan
 */
export function getPlanLabel(plan: PlanType, cycle: BillingCycle): string {
  return PRICING[plan][cycle].label;
}

/**
 * Calculate savings percentage for annual vs monthly
 */
export function getAnnualSavingsPercent(plan: PlanType): number {
  const monthlyTotal = PRICING[plan].monthly.amount * 12;
  const annualTotal = PRICING[plan].annual.amount;
  return Math.round(((monthlyTotal - annualTotal) / monthlyTotal) * 100);
}
