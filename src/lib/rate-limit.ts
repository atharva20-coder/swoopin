import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

/**
 * Rate limiter using Upstash Redis
 * Different tiers for different endpoint types
 */

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Rate limit tiers
 */
export const RateLimitTiers = {
  // Strict: Login, signup, password reset
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "ratelimit:auth",
  }),

  // Standard: Regular API endpoints
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "ratelimit:api",
  }),

  // Heavy: AI, Instagram API calls
  heavy: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    analytics: true,
    prefix: "ratelimit:heavy",
  }),

  // Webhooks: High volume external
  webhook: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, "1 m"),
    analytics: true,
    prefix: "ratelimit:webhook",
  }),
};

export type RateLimitTier = keyof typeof RateLimitTiers;

/**
 * Get identifier from request (IP or user ID)
 */
function getIdentifier(req: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP from various headers
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0] ?? realIp ?? "anonymous";

  return `ip:${ip}`;
}

/**
 * Rate limit a request
 */
export async function rateLimit(
  req: NextRequest,
  tier: RateLimitTier = "api",
  userId?: string
) {
  const identifier = getIdentifier(req, userId);
  const limiter = RateLimitTiers[tier];

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Check rate limit without consuming
 */
export async function checkRateLimit(
  req: NextRequest,
  tier: RateLimitTier = "api",
  userId?: string
) {
  const identifier = getIdentifier(req, userId);
  const limiter = RateLimitTiers[tier];

  const result = await limiter.limit(identifier);

  // Reset the consumed token
  if (result.success) {
    await limiter.resetUsedTokens(identifier);
  }

  return {
    allowed: result.success,
    remaining: result.remaining,
  };
}
