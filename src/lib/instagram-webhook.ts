import crypto from "crypto";

/**
 * Instagram Webhook Signature Verification
 *
 * Instagram/Meta sends a X-Hub-Signature-256 header containing:
 * sha256=<HMAC-SHA256 signature of request body using app secret>
 *
 * We must verify this signature to ensure webhooks are authentic.
 *
 * Uses INSTAGRAM_CLIENT_SECRET (the App Secret from Facebook App Dashboard)
 */

// Use FB_APP_SECRET for signature verification (the App Secret from Facebook App Dashboard)
// Falls back to INSTAGRAM_CLIENT_SECRET if FB_APP_SECRET not set
const INSTAGRAM_APP_SECRET =
  process.env.FB_APP_SECRET || process.env.INSTAGRAM_CLIENT_SECRET;

/**
 * Verify Instagram webhook signature
 * @param payload - Raw request body as string
 * @param signature - X-Hub-Signature-256 header value
 * @returns true if signature is valid
 */
export function verifyInstagramSignature(
  payload: string,
  signature: string | null,
): boolean {
  if (!signature) {
    console.error("[Webhook] Missing X-Hub-Signature-256 header");
    return false;
  }

  if (!INSTAGRAM_APP_SECRET) {
    console.error(
      "[Webhook] INSTAGRAM_CLIENT_SECRET not configured in environment",
    );
    // In development, allow webhooks without verification if secret not set
    if (process.env.NODE_ENV === "development") {
      console.warn("[Webhook] Allowing unverified webhook in development mode");
      return true;
    }
    return false;
  }

  // Signature format: sha256=<hash>
  const signatureParts = signature.split("=");
  if (signatureParts.length !== 2 || signatureParts[0] !== "sha256") {
    console.error(
      "[Webhook] Invalid signature format:",
      signature.substring(0, 20),
    );
    return false;
  }

  const receivedHash = signatureParts[1];

  // Calculate expected hash using INSTAGRAM_CLIENT_SECRET
  const expectedHash = crypto
    .createHmac("sha256", INSTAGRAM_APP_SECRET)
    .update(payload)
    .digest("hex");

  // Use timing-safe comparison to prevent timing attacks
  try {
    const receivedBuffer = Buffer.from(receivedHash, "hex");
    const expectedBuffer = Buffer.from(expectedHash, "hex");

    if (receivedBuffer.length !== expectedBuffer.length) {
      console.error("[Webhook] Signature length mismatch");
      return false;
    }

    const isValid = crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
    if (!isValid) {
      console.error(
        "[Webhook] Signature mismatch - check that INSTAGRAM_CLIENT_SECRET matches App Secret in Facebook Dashboard",
      );
    }
    return isValid;
  } catch (error) {
    console.error("[Webhook] Signature comparison error:", error);
    return false;
  }
}

/**
 * Verify Instagram webhook subscription challenge
 * This is only used during initial webhook setup in Facebook App Dashboard
 *
 * @param mode - hub.mode parameter
 * @param token - hub.verify_token parameter (you set this when subscribing)
 * @param challenge - hub.challenge parameter
 * @returns challenge string if valid, null otherwise
 */
export function verifySubscription(
  mode: string | null,
  token: string | null,
  challenge: string | null,
): string | null {
  if (mode !== "subscribe") {
    return null;
  }

  // The verify token is a custom token you set when subscribing to webhooks
  // For now, we'll accept any token since the subscription is already done
  // In production, you should set FB_WEBHOOK_VERIFY_TOKEN env var
  const expectedToken = process.env.FB_WEBHOOK_VERIFY_TOKEN;

  if (!expectedToken) {
    console.warn(
      "[Webhook] FB_WEBHOOK_VERIFY_TOKEN not set - accepting subscription for setup",
    );
    // Allow subscription if no verify token is configured (for initial setup)
    return challenge;
  }

  if (token !== expectedToken) {
    console.error("[Webhook] Verify token mismatch");
    return null;
  }

  return challenge;
}
