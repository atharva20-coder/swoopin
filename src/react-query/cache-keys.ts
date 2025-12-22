/**
 * Centralized cache keys for React Query
 * Use these constants for consistent cache key management
 */

export const CACHE_KEYS = {
  // User related
  USER_PROFILE: "user-profile",
  USER_SUBSCRIPTION: "user-subscription",
  USER_USAGE: "user-usage",
  
  // Automations
  AUTOMATIONS: "user-automations",
  AUTOMATION_INFO: (id: string) => ["automation-info", id] as const,
  AUTOMATION_FLOW: (id: string) => ["automation-flow", id] as const,
  
  // Notifications
  NOTIFICATIONS: "user-notifications",
  
  // Posts
  INSTAGRAM_POSTS: "instagram-posts",
  SCHEDULED_POSTS: "scheduled-posts",
  
  // Analytics
  ANALYTICS: "analytics",
  ANALYTICS_PERIOD: (period: string) => ["analytics", period] as const,
  
  // Integration
  INTEGRATIONS: "integrations",
  
  // Admin
  ADMIN_USERS: "admin-users",
  ADMIN_STATS: "admin-stats",
  ADMIN_ENQUIRIES: "admin-enquiries",
} as const;

/**
 * Cache time configurations (in milliseconds)
 */
export const CACHE_TIMES = {
  // Short-lived data (1 minute)
  SHORT: 1000 * 60,
  
  // Medium-lived data (5 minutes)
  MEDIUM: 1000 * 60 * 5,
  
  // Long-lived data (1 hour)
  LONG: 1000 * 60 * 60,
  
  // Very long-lived data (24 hours)
  DAY: 1000 * 60 * 60 * 24,
  
  // Permanent until invalidated
  PERMANENT: Infinity,
} as const;
