/**
 * Access Control Service
 * 
 * Manages feature access based on subscription plans.
 * Used throughout the application to gate features.
 */

import { client } from "@/lib/prisma";
import { SUBSCRIPTION_PLAN } from "@prisma/client";

// Plan limits configuration
export const PLAN_LIMITS = {
  FREE: {
    name: "Starter",
    dmsPerMonth: 200,
    automations: 3,
    scheduledPosts: 1,
    aiResponses: false,
    analytics: "basic",
    prioritySupport: false,
    earlyAccess: false,
    apiAccess: false,
  },
  PRO: {
    name: "Pro",
    dmsPerMonth: -1, // Unlimited
    automations: -1, // Unlimited
    scheduledPosts: -1, // Unlimited
    aiResponses: true,
    analytics: "detailed",
    prioritySupport: true,
    earlyAccess: false,
    apiAccess: false,
  },
  ENTERPRISE: {
    name: "Enterprise",
    dmsPerMonth: -1, // Unlimited
    automations: -1, // Unlimited
    scheduledPosts: -1, // Unlimited
    aiResponses: true,
    analytics: "detailed",
    prioritySupport: true,
    earlyAccess: true,
    apiAccess: true,
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
      dms: { used: 0, limit: 200, unlimited: false },
      automations: { used: 0, limit: 3, unlimited: false },
      scheduledPosts: { used: 0, limit: 1, unlimited: false },
    };
  }
  
  return getUserUsageByEmail(user.email);
}
