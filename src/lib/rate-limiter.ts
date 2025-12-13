import { Ratelimit } from "@upstash/ratelimit";
import { getRedis, isRedisAvailable } from "./redis";

/**
 * Token Bucket Rate Limiter
 * 
 * How it works:
 * - Each user has a "bucket" of tokens
 * - Tokens refill at a constant rate (e.g., 10 per second)
 * - Each request consumes one token
 * - If bucket is empty, request is denied
 * 
 * Example: 100 tokens, refill 10/second
 * - User can burst 100 requests instantly
 * - Then must wait for tokens to refill
 * - Sustained rate: 10 requests/second
 */

// Rate limit configurations for different endpoints
export const RateLimitTier = {
  // General API: 100 requests per minute
  API: {
    tokens: 100,
    window: "1m" as const,
  },
  // Authentication: 10 requests per minute (prevent brute force)
  AUTH: {
    tokens: 10,
    window: "1m" as const,
  },
  // Webhook: 1000 requests per minute (high volume from Instagram)
  WEBHOOK: {
    tokens: 1000,
    window: "1m" as const,
  },
  // Configuration changes: 20 per minute
  CONFIG: {
    tokens: 20,
    window: "1m" as const,
  },
  // Strict: 5 requests per minute (for sensitive operations)
  STRICT: {
    tokens: 5,
    window: "1m" as const,
  },
} as const;

export type RateLimitTierType = keyof typeof RateLimitTier;

// Lazy-initialized rate limiters (created on first use)
const rateLimitersCache: Partial<Record<RateLimitTierType, Ratelimit>> = {};

const getRateLimiter = (tier: RateLimitTierType): Ratelimit | null => {
  const redis = getRedis();
  if (!redis) return null;
  
  if (!rateLimitersCache[tier]) {
    rateLimitersCache[tier] = new Ratelimit({
      redis,
      limiter: Ratelimit.tokenBucket(
        RateLimitTier[tier].tokens, 
        RateLimitTier[tier].window, 
        RateLimitTier[tier].tokens
      ),
      analytics: false, // Disable analytics for speed
      prefix: "@swoopin/ratelimit",
    });
  }
  
  return rateLimitersCache[tier]!;
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // timestamp when bucket refills
  retryAfter?: number; // seconds until next request allowed
};

/**
 * Check if rate limiting is disabled via environment variable
 * Set DISABLE_RATE_LIMIT=true in .env for development/testing
 */
const isRateLimitDisabled = (): boolean => {
  return process.env.DISABLE_RATE_LIMIT === "true";
};

/**
 * Check rate limit for a given identifier and tier
 * 
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param tier - Rate limit tier to use
 * @returns RateLimitResult with success status and metadata
 */
export const checkRateLimit = async (
  identifier: string,
  tier: RateLimitTierType = "API"
): Promise<RateLimitResult> => {
  // If rate limiting is disabled via env var, allow all requests
  if (isRateLimitDisabled()) {
    console.log("⚠️ Rate limiting DISABLED via DISABLE_RATE_LIMIT env var");
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: Date.now() + 60000,
    };
  }

  // If Redis not configured, allow all requests (development mode)
  if (!isRedisAvailable()) {
    console.log("⚠️ Rate limiting skipped - Redis not configured");
    return {
      success: true,
      limit: RateLimitTier[tier].tokens,
      remaining: RateLimitTier[tier].tokens,
      reset: Date.now() + 60000,
    };
  }

  const limiter = getRateLimiter(tier);
  if (!limiter) {
    return {
      success: true,
      limit: RateLimitTier[tier].tokens,
      remaining: RateLimitTier[tier].tokens,
      reset: Date.now() + 60000,
    };
  }

  try {
    const result = await limiter.limit(identifier);
    
    const response: RateLimitResult = {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };

    if (!result.success) {
      // Calculate retry-after in seconds
      response.retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
      console.log(`🚫 Rate limit exceeded for ${identifier} (${tier}). Retry after ${response.retryAfter}s`);
    }

    return response;
  } catch (error) {
    console.error("Rate limit check error:", error);
    // On error, allow the request (fail open)
    return {
      success: true,
      limit: RateLimitTier[tier].tokens,
      remaining: 1,
      reset: Date.now() + 60000,
    };
  }
};

/**
 * Get client identifier from request
 * Uses IP address as the identifier
 */
export const getClientIdentifier = (request: Request): string => {
  // Try to get real IP from headers (when behind proxy/Vercel)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a default (shouldn't happen in production)
  return "unknown";
};

/**
 * Create rate limit response headers
 */
export const getRateLimitHeaders = (result: RateLimitResult): HeadersInit => {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
    ...(result.retryAfter && { "Retry-After": result.retryAfter.toString() }),
  };
};

/**
 * Apply rate limiting to an API route
 * Returns null if allowed, or a Response if rate limited
 */
export const applyRateLimit = async (
  request: Request,
  tier: RateLimitTierType = "API"
): Promise<{ allowed: boolean; result: RateLimitResult; response?: Response }> => {
  const identifier = getClientIdentifier(request);
  const result = await checkRateLimit(identifier, tier);

  if (!result.success) {
    const response = new Response(
      JSON.stringify({
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: result.retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...getRateLimitHeaders(result),
        },
      }
    );
    return { allowed: false, result, response };
  }

  return { allowed: true, result };
};
