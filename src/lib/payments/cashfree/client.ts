/**
 * Cashfree SDK Client Configuration
 * 
 * Initializes and configures the Cashfree Payment Gateway SDK.
 * Uses SDK v5+ API with Cashfree class instance methods.
 */

import { Cashfree } from 'cashfree-pg';

// Environment validation
const requiredEnvVars = ['CASHFREE_APP_ID', 'CASHFREE_APP_SECRET'] as const;

function validateEnvironment(): void {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required Cashfree environment variables: ${missing.join(', ')}`);
  }
}

// Singleton client instance
let cashfreeInstance: typeof Cashfree | null = null;

/**
 * Get the Cashfree API version
 * Latest version as per Cashfree docs: 2023-08-01
 */
export function getApiVersion(): string {
  return '2023-08-01';
}

/**
 * Get the Cashfree client instance
 * Initializes on first call
 */
export function getCashfreeClient(): typeof Cashfree {
  if (!cashfreeInstance) {
    validateEnvironment();
    cashfreeInstance = Cashfree;
  }
  return cashfreeInstance;
}

/**
 * Get app ID and secret for API calls
 */
export function getCredentials() {
  validateEnvironment();
  return {
    appId: process.env.CASHFREE_APP_ID!,
    secretKey: process.env.CASHFREE_APP_SECRET!,
  };
}

/**
 * Get the Cashfree base URL for the current environment
 */
export function getCashfreeBaseUrl(): string {
  const environment = process.env.CASHFREE_ENVIRONMENT?.toLowerCase();
  return environment === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.CASHFREE_ENVIRONMENT?.toLowerCase() === 'production';
}

/**
 * Get common headers for Cashfree API calls
 */
export function getApiHeaders() {
  const { appId, secretKey } = getCredentials();
  return {
    'Content-Type': 'application/json',
    'x-api-version': getApiVersion(),
    'x-client-id': appId,
    'x-client-secret': secretKey,
  };
}

// Export the Cashfree class
export { Cashfree as cashfreeClient };
