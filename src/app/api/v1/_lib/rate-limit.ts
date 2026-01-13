import { Ratelimit } from '@upstash/ratelimit';
import { getRedis, isRedisAvailable } from '@/lib/redis';
import { rateLimited } from './response';
import type { NextResponse } from 'next/server';

/**
 * Rate Limiting Configuration
 * Different limits for different endpoint types
 */
export const RateLimitConfigs = {
  // Standard API endpoints
  standard: { requests: 100, window: '1m' as const },
  
  // Sensitive endpoints (auth, payments)
  sensitive: { requests: 10, window: '1m' as const },
  
  // Heavy operations (analytics, exports)
  heavy: { requests: 20, window: '1m' as const },
  
  // Webhook endpoints (high volume)
  webhook: { requests: 500, window: '1m' as const },
} as const;

type RateLimitType = keyof typeof RateLimitConfigs;

// Cache rate limiters
const rateLimiters = new Map<RateLimitType, Ratelimit>();

function getRateLimiter(type: RateLimitType): Ratelimit | null {
  if (!isRedisAvailable()) {
    return null;
  }

  if (rateLimiters.has(type)) {
    return rateLimiters.get(type)!;
  }

  const redis = getRedis();
  if (!redis) return null;

  const config = RateLimitConfigs[type];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    analytics: true,
    prefix: `ratelimit:api:${type}`,
  });

  rateLimiters.set(type, limiter);
  return limiter;
}

/**
 * Check rate limit for a user/IP
 * Returns null if allowed, or a 429 response if rate limited
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'standard'
): Promise<NextResponse | null> {
  const limiter = getRateLimiter(type);
  
  // If Redis not available, allow request (graceful degradation)
  if (!limiter) {
    return null;
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      const response = rateLimited(
        `Rate limit exceeded. Try again in ${retryAfter} seconds.`
      );
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', reset.toString());
      response.headers.set('Retry-After', retryAfter.toString());
      
      return response;
    }

    return null;
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow request (fail open)
    return null;
  }
}

/**
 * Rate limit by user ID
 */
export async function rateLimitByUser(
  userId: string,
  type: RateLimitType = 'standard'
): Promise<NextResponse | null> {
  return checkRateLimit(`user:${userId}`, type);
}

/**
 * Rate limit by IP address
 */
export async function rateLimitByIp(
  ip: string,
  type: RateLimitType = 'standard'
): Promise<NextResponse | null> {
  return checkRateLimit(`ip:${ip}`, type);
}
