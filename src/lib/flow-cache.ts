/**
 * localStorage caching utility for Flow Builder
 * Provides auto-save drafts and faster page loads
 */

const FLOW_CACHE_PREFIX = "swoopin_flow_";
const FLOW_CACHE_VERSION = "v1";
const CACHE_EXPIRY_HOURS = 24;

interface FlowCacheData {
  nodes: unknown[];
  edges: unknown[];
  timestamp: number;
  version: string;
}

/**
 * Get cache key for a specific automation
 */
const getCacheKey = (automationId: string) => 
  `${FLOW_CACHE_PREFIX}${automationId}`;

/**
 * Check if running in browser
 */
const isBrowser = () => typeof window !== "undefined";

/**
 * Save flow data to localStorage
 */
export const saveFlowToCache = (
  automationId: string,
  nodes: unknown[],
  edges: unknown[]
): boolean => {
  if (!isBrowser()) return false;
  
  try {
    const cacheData: FlowCacheData = {
      nodes,
      edges,
      timestamp: Date.now(),
      version: FLOW_CACHE_VERSION,
    };
    
    localStorage.setItem(
      getCacheKey(automationId),
      JSON.stringify(cacheData)
    );
    return true;
  } catch (error) {
    console.error("Failed to save flow to cache:", error);
    return false;
  }
};

/**
 * Load flow data from localStorage
 */
export const loadFlowFromCache = (
  automationId: string
): { nodes: unknown[]; edges: unknown[] } | null => {
  if (!isBrowser()) return null;
  
  try {
    const cached = localStorage.getItem(getCacheKey(automationId));
    if (!cached) return null;
    
    const cacheData: FlowCacheData = JSON.parse(cached);
    
    // Check version
    if (cacheData.version !== FLOW_CACHE_VERSION) {
      clearFlowCache(automationId);
      return null;
    }
    
    // Check expiry
    const hoursOld = (Date.now() - cacheData.timestamp) / (1000 * 60 * 60);
    if (hoursOld > CACHE_EXPIRY_HOURS) {
      clearFlowCache(automationId);
      return null;
    }
    
    return {
      nodes: cacheData.nodes,
      edges: cacheData.edges,
    };
  } catch (error) {
    console.error("Failed to load flow from cache:", error);
    return null;
  }
};

/**
 * Clear cached flow data
 */
export const clearFlowCache = (automationId: string): void => {
  if (!isBrowser()) return;
  
  try {
    localStorage.removeItem(getCacheKey(automationId));
  } catch (error) {
    console.error("Failed to clear flow cache:", error);
  }
};

/**
 * Clear all flow caches
 */
export const clearAllFlowCaches = (): void => {
  if (!isBrowser()) return;
  
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(FLOW_CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error("Failed to clear all flow caches:", error);
  }
};

/**
 * Get cache timestamp for a specific automation
 */
export const getFlowCacheTimestamp = (automationId: string): Date | null => {
  if (!isBrowser()) return null;
  
  try {
    const cached = localStorage.getItem(getCacheKey(automationId));
    if (!cached) return null;
    
    const cacheData: FlowCacheData = JSON.parse(cached);
    return new Date(cacheData.timestamp);
  } catch {
    return null;
  }
};

/**
 * Check if cache exists and is valid
 */
export const hasValidFlowCache = (automationId: string): boolean => {
  return loadFlowFromCache(automationId) !== null;
};
