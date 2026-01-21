import crypto from "crypto";

/**
 * Instagram Webhook Signature Verification
 *
 * Instagram/Meta sends a X-Hub-Signature-256 header containing:
 * sha256=<HMAC-SHA256 signature of request body using app secret>
 *
 * We must verify this signature to ensure webhooks are authentic.
 *
 * For Instagram API with Instagram Login, Meta may use either:
 * - FB_APP_SECRET (Facebook App Secret from Settings > Basic)
 * - INSTAGRAM_CLIENT_SECRET (Instagram App Secret from Instagram Business Login settings)
 *
 * We try both to determine which one works.
 */

/**
 * Helper to verify signature with a specific secret
 */
function verifyWithSecret(
  payload: string,
  receivedHash: string,
  secret: string,
): boolean {
  const expectedHash = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  try {
    const receivedBuffer = Buffer.from(receivedHash, "hex");
    const expectedBuffer = Buffer.from(expectedHash, "hex");

    if (receivedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

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

  // Get both possible secrets
  const fbAppSecret = process.env.FB_APP_SECRET;
  const instagramClientSecret = process.env.INSTAGRAM_CLIENT_SECRET;

  // In development, allow webhooks without verification if no secrets are set
  if (!fbAppSecret && !instagramClientSecret) {
    console.error(
      "[Webhook] No secrets configured (FB_APP_SECRET or INSTAGRAM_CLIENT_SECRET)",
    );
    if (process.env.NODE_ENV === "development") {
      console.warn("[Webhook] Allowing unverified webhook in development mode");
      return true;
    }
    return false;
  }

  // Try FB_APP_SECRET first (Facebook App Secret from Settings > Basic)
  if (fbAppSecret) {
    const isValid = verifyWithSecret(payload, receivedHash, fbAppSecret);
    if (isValid) {
      console.log("[Webhook] ✓ Signature verified using FB_APP_SECRET");
      return true;
    }
  }

  // Try INSTAGRAM_CLIENT_SECRET (Instagram App Secret from Business Login settings)
  if (instagramClientSecret) {
    const isValid = verifyWithSecret(
      payload,
      receivedHash,
      instagramClientSecret,
    );
    if (isValid) {
      console.log(
        "[Webhook] ✓ Signature verified using INSTAGRAM_CLIENT_SECRET",
      );
      return true;
    }
  }

  // Both failed
  console.error("[Webhook] Signature verification failed with both secrets");
  console.error(
    "[Webhook] Tried FB_APP_SECRET:",
    fbAppSecret ? "yes" : "not set",
  );
  console.error(
    "[Webhook] Tried INSTAGRAM_CLIENT_SECRET:",
    instagramClientSecret ? "yes" : "not set",
  );

  return false;
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
