import { getRedis, isRedisAvailable } from "./redis";

const CACHE_TTL = 300; // 5 minutes in seconds

type CacheKey = 
  | `user:${string}:profile`
  | `user:${string}:automations`
  | `user:${string}:insights`
  | `user:${string}:notifications`
  | `automation:${string}`;

/**
 * Get cached data from Redis
 */
export async function getCache<T>(key: CacheKey): Promise<T | null> {
  if (!isRedisAvailable()) return null;
  
  try {
    const redis = getRedis();
    if (!redis) return null;
    
    const data = await redis.get<T>(key);
    return data;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
}

/**
 * Set cached data in Redis with TTL
 */
export async function setCache<T>(
  key: CacheKey,
  data: T,
  ttl: number = CACHE_TTL
): Promise<void> {
  if (!isRedisAvailable()) return;
  
  try {
    const redis = getRedis();
    if (!redis) return;
    
    await redis.set(key, data, { ex: ttl });
  } catch (error) {
    console.error("Cache set error:", error);
  }
}

/**
 * Delete cached data from Redis
 */
export async function deleteCache(key: CacheKey): Promise<void> {
  if (!isRedisAvailable()) return;
  
  try {
    const redis = getRedis();
    if (!redis) return;
    
    await redis.del(key);
  } catch (error) {
    console.error("Cache delete error:", error);
  }
}

/**
 * Delete all cache keys matching a pattern
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  if (!isRedisAvailable()) return;
  
  try {
    const redis = getRedis();
    if (!redis) return;
    
    // Upstash doesn't support KEYS command in REST API
    // So we'll invalidate specific keys when mutations happen
    console.log("Cache pattern invalidation requested:", pattern);
  } catch (error) {
    console.error("Cache pattern delete error:", error);
  }
}

/**
 * Get or set cache - fetch from cache, or compute and cache if not present
 */
export async function getOrSetCache<T>(
  key: CacheKey,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> {
  // Try to get from cache first
  const cached = await getCache<T>(key);
  if (cached !== null) {
    console.log(`Cache HIT: ${key}`);
    return cached;
  }
  
  // Fetch fresh data
  console.log(`Cache MISS: ${key}`);
  const data = await fetchFn();
  
  // Cache it for next time
  await setCache(key, data, ttl);
  
  return data;
}

/**
 * Invalidate user-related caches (call after mutations)
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  await Promise.all([
    deleteCache(`user:${userId}:profile`),
    deleteCache(`user:${userId}:automations`),
    deleteCache(`user:${userId}:insights`),
    deleteCache(`user:${userId}:notifications`),
  ]);
}

/**
 * Invalidate automation cache
 */
export async function invalidateAutomationCache(automationId: string): Promise<void> {
  await deleteCache(`automation:${automationId}`);
}
