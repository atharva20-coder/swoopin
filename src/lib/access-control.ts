/**
 * Access Control Service
 * 
 * Manages feature access based on subscription plans.
 * Used throughout the application to gate features.
 */

import { client } from "@/lib/prisma";
import { SUBSCRIPTION_PLAN } from "@prisma/client";

// Plan limits configuration - Strategic limitations to drive upgrades
export const PLAN_LIMITS = {
  FREE: {
    name: "Starter",
    dmsPerMonth: 50,           // Very limited - forces upgrade quickly
    automations: 1,            // Can only test ONE automation
    scheduledPosts: 0,         // Scheduling is a PRO feature
    aiResponses: false,        // AI is PRO feature
    aiResponsesPerMonth: 0,
    analytics: "basic",
    analyticsRetentionDays: 7, // Only 7 days of history
    prioritySupport: false,
    earlyAccess: false,
    apiAccess: false,
    showBranding: true,        // "Powered by Swoopin" in messages
    carouselTemplates: 0,      // No carousel templates
    commentReply: false,       // No comment replies - DM only
  },
  PRO: {
    name: "Pro",
    dmsPerMonth: 1000,         // Generous but capped
    automations: 10,           // Enough for most users
    scheduledPosts: 20,        // Good for active creators
    aiResponses: true,
    aiResponsesPerMonth: 50,   // Limited AI - not unlimited
    analytics: "detailed",
    analyticsRetentionDays: 90, // 90 days history
    prioritySupport: true,
    earlyAccess: false,
    apiAccess: false,
    showBranding: false,       // No branding
    carouselTemplates: 3,      // Limited templates
    commentReply: true,        // Full comment reply access
  },
  // ENTERPRISE is a custom plan - limits are configured per user by admin
  // These are defaults that can be overridden with custom limits stored in DB
  ENTERPRISE: {
    name: "Enterprise",
    isCustomPlan: true,        // Flag indicating this is a custom, negotiated plan
    // Default to PRO limits - admin configures actual limits per user
    dmsPerMonth: 1000,         // Customizable per user
    automations: 10,           // Customizable per user
    scheduledPosts: 20,        // Customizable per user
    aiResponses: true,
    aiResponsesPerMonth: 50,   // Customizable per user
    analytics: "detailed",
    analyticsRetentionDays: 90, // Customizable per user
    prioritySupport: true,
    earlyAccess: true,
    apiAccess: true,           // Enterprise gets API access
    showBranding: false,
    carouselTemplates: 3,      // Customizable per user
    commentReply: true,
    // Enterprise-exclusive features (can be toggled per user)
    multiAccount: false,       // Configurable per user
    teamSeats: false,          // Configurable per user  
    customAiTraining: false,   // Configurable per user
    dedicatedSupport: true,    // Email/Instagram DM support
  },
};

/**
 * Get user's current plan and limits by email
 */
export async function getUserPlanLimitsByEmail(email: string) {
  const user = await client.user.findUnique({
    where: { email },
    include: { subscription: true },
  });

  const plan = (user?.subscription?.plan || "FREE") as keyof typeof PLAN_LIMITS;
  return {
    plan,
    limits: PLAN_LIMITS[plan],
    subscription: user?.subscription,
  };
}

/**
 * Get user's current plan and limits (legacy - by userId)
 */
export async function getUserPlanLimits(userId: string) {
  const user = await client.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  const plan = (user?.subscription?.plan || "FREE") as keyof typeof PLAN_LIMITS;
  return {
    plan,
    limits: PLAN_LIMITS[plan],
    subscription: user?.subscription,
  };
}

/**
 * Check if user can perform action based on plan (by email)
 */
export async function canPerformActionByEmail(
  email: string,
  action: "create_automation" | "send_dm" | "schedule_post" | "use_ai" | "access_api"
): Promise<{ allowed: boolean; reason?: string; upgrade?: string }> {
  const { plan, limits } = await getUserPlanLimitsByEmail(email);

  switch (action) {
    case "create_automation": {
      if (limits.automations === -1) return { allowed: true };
      
      const automationCount = await client.automation.count({
        where: { User: { email } },
      });
      
      if (automationCount >= limits.automations) {
        return {
          allowed: false,
          reason: `Starter plan limited to ${limits.automations} automations`,
          upgrade: "PRO",
        };
      }
      return { allowed: true };
    }

    case "send_dm": {
      if (limits.dmsPerMonth === -1) return { allowed: true };
      
      // Count DMs sent this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const dmCount = await client.dms.count({
        where: {
          Automation: { User: { email } },
          createdAt: { gte: startOfMonth },
        },
      });
      
      if (dmCount >= limits.dmsPerMonth) {
        return {
          allowed: false,
          reason: `You've reached your monthly limit of ${limits.dmsPerMonth} DMs`,
          upgrade: "PRO",
        };
      }
      return { allowed: true };
    }

    case "schedule_post": {
      if (limits.scheduledPosts === -1) return { allowed: true };
      
      const scheduledCount = await client.scheduledPost.count({
        where: {
          User: { email },
          status: "SCHEDULED",
        },
      });
      
      if (scheduledCount >= limits.scheduledPosts) {
        return {
          allowed: false,
          reason: `Starter plan limited to ${limits.scheduledPosts} scheduled post`,
          upgrade: "PRO",
        };
      }
      return { allowed: true };
    }

    case "use_ai": {
      if (!limits.aiResponses) {
        return {
          allowed: false,
          reason: "AI responses require Pro plan",
          upgrade: "PRO",
        };
      }
      return { allowed: true };
    }

    case "access_api": {
      if (!limits.apiAccess) {
        return {
          allowed: false,
          reason: "API access requires Enterprise plan",
          upgrade: "ENTERPRISE",
        };
      }
      return { allowed: true };
    }

    default:
      return { allowed: true };
  }
}

/**
 * Check if user can perform action (legacy - by userId)
 */
export async function canPerformAction(
  userId: string,
  action: "create_automation" | "send_dm" | "schedule_post" | "use_ai" | "access_api"
): Promise<{ allowed: boolean; reason?: string; upgrade?: string }> {
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  
  if (!user) return { allowed: false, reason: "User not found" };
  return canPerformActionByEmail(user.email, action);
}

/**
 * Get user's current usage stats by email
 */
export async function getUserUsageByEmail(email: string) {
  const { limits } = await getUserPlanLimitsByEmail(email);
  
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [dmCount, automationCount, scheduledCount] = await Promise.all([
    client.dms.count({
      where: {
        Automation: { User: { email } },
        createdAt: { gte: startOfMonth },
      },
    }),
    client.automation.count({
      where: { User: { email } },
    }),
    client.scheduledPost.count({
      where: {
        User: { email },
        status: "SCHEDULED",
      },
    }),
  ]);

  return {
    dms: {
      used: dmCount,
      limit: limits.dmsPerMonth,
      unlimited: limits.dmsPerMonth === -1,
    },
    automations: {
      used: automationCount,
      limit: limits.automations,
      unlimited: limits.automations === -1,
    },
    scheduledPosts: {
      used: scheduledCount,
      limit: limits.scheduledPosts,
      unlimited: limits.scheduledPosts === -1,
    },
  };
}

/**
 * Get user's current usage stats (legacy - by userId)
 */
export async function getUserUsage(userId: string) {
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  
  if (!user) {
    return {
      dms: { used: 0, limit: 50, unlimited: false },
      automations: { used: 0, limit: 1, unlimited: false },
      scheduledPosts: { used: 0, limit: 0, unlimited: false },
    };
  }
  
  return getUserUsageByEmail(user.email);
}
