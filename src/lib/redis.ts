import { Redis } from "@upstash/redis";

// Lazy-initialized Redis client to avoid startup cost
let redis: Redis | null = null;
let initialized = false;

const getRedis = () => {
  if (initialized) return redis;

  // Check if Redis is configured
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Silent check - rate limiting disabled if Redis not configured
  if (!redisUrl || !redisToken) {
    initialized = true;
    return null;
  }

  redis = new Redis({ url: redisUrl, token: redisToken });
  initialized = true;
  return redis;
};

// Export getter function for lazy access
export { getRedis };

// Check if Redis is available
export const isRedisAvailable = (): boolean => {
  return getRedis() !== null;
};
