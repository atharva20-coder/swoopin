import crypto from "crypto";

/**
 * Instagram Webhook Signature Verification
 * 
 * Instagram/Meta sends a X-Hub-Signature-256 header containing:
 * sha256=<HMAC-SHA256 signature of request body using app secret>
 * 
 * We must verify this signature to ensure webhooks are authentic.
 */

const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
const INSTAGRAM_VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN;

/**
 * Verify Instagram webhook signature
 * @param payload - Raw request body as string
 * @param signature - X-Hub-Signature-256 header value
 * @returns true if signature is valid
 */
export function verifyInstagramSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!signature) {
    console.error("Instagram webhook: Missing signature header");
    return false;
  }

  if (!INSTAGRAM_APP_SECRET) {
    console.error("Instagram webhook: INSTAGRAM_APP_SECRET not configured");
    // In development, allow webhooks without verification if secret not set
    if (process.env.NODE_ENV === "development") {
      console.warn("Instagram webhook: Allowing unverified webhook in development");
      return true;
    }
    return false;
  }

  // Signature format: sha256=<hash>
  const signatureParts = signature.split("=");
  if (signatureParts.length !== 2 || signatureParts[0] !== "sha256") {
    console.error("Instagram webhook: Invalid signature format");
    return false;
  }

  const receivedHash = signatureParts[1];

  // Calculate expected hash
  const expectedHash = crypto
    .createHmac("sha256", INSTAGRAM_APP_SECRET)
    .update(payload)
    .digest("hex");

  // Use timing-safe comparison to prevent timing attacks
  try {
    const receivedBuffer = Buffer.from(receivedHash, "hex");
    const expectedBuffer = Buffer.from(expectedHash, "hex");
    
    if (receivedBuffer.length !== expectedBuffer.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
  } catch (error) {
    console.error("Instagram webhook: Signature comparison error", error);
    return false;
  }
}

/**
 * Verify Instagram webhook subscription challenge
 * @param mode - hub.mode parameter
 * @param token - hub.verify_token parameter
 * @param challenge - hub.challenge parameter
 * @returns challenge string if valid, null otherwise
 */
export function verifySubscription(
  mode: string | null,
  token: string | null,
  challenge: string | null
): string | null {
  if (mode !== "subscribe") {
    return null;
  }

  if (!INSTAGRAM_VERIFY_TOKEN) {
    console.error("Instagram webhook: INSTAGRAM_VERIFY_TOKEN not configured");
    return null;
  }

  if (token !== INSTAGRAM_VERIFY_TOKEN) {
    console.error("Instagram webhook: Verify token mismatch");
    return null;
  }

  return challenge;
}
