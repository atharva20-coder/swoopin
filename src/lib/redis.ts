import { Redis } from "@upstash/redis";

// Lazy-initialized Redis client to avoid startup cost
let redis: Redis | null = null;
let initialized = false;

const getRedis = () => {
  if (initialized) return redis;
  
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("⚠️ Redis not configured. Rate limiting disabled.");
    initialized = true;
    return null;
  }

  redis = new Redis({ url, token });
  initialized = true;
  return redis;
};

// Export getter function for lazy access
export { getRedis };

// Check if Redis is available
export const isRedisAvailable = (): boolean => {
  return getRedis() !== null;
};
