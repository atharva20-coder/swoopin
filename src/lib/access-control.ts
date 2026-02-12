/**
 * Access Control Service
 *
 * Manages feature access based on subscription plans.
 * Used throughout the application to gate features.
 *
 * Tier mapping (DB enum → Display):
 *   FREE       → Starter (₹0)
 *   PRO        → Plus (₹1,499/mo)
 *   ENTERPRISE → Pro (₹2,999/mo)
 */

import { client } from "@/lib/prisma";
import { SUBSCRIPTION_PLAN } from "@prisma/client";

// Plan limits configuration — Strategic limitations to drive upgrades
export const PLAN_LIMITS = {
  FREE: {
    name: "Starter",
    dmsPerDay: 200,
    smartAiPerDay: 10,
    smartAiTrialDays: 7, // AI only available for 1 week after integrating a social media
    commentRepliesUnlimited: true,
    automations: 3, // Lifetime cap until upgraded
    automationsLifetimeCap: true, // Automations don't reset monthly
    maxActiveAutomations: 3,
    editsPerAutomation: 1, // 1 edit per automation (lifetime)
    nodesPerAutomation: -1, // No node limit
    carouselTemplates: 1, // One-time
    buttonTemplates: 1, // One-time
    followerCheckNode: false, // No access
    scheduledPosts: 0,
    analytics: "basic" as const,
    analyticsRetentionDays: 7,
    prioritySupport: false,
    earlyAccess: false,
    apiAccess: false,
    showBranding: true, // "Powered by NinthNode"
  },
  PRO: {
    name: "Plus",
    dmsPerDay: 1000,
    smartAiPerDay: 100,
    smartAiTrialDays: -1, // No trial restriction
    commentRepliesUnlimited: true,
    automations: 25, // Per month
    automationsLifetimeCap: false,
    maxActiveAutomations: 40, // Recent 40
    editsPerAutomation: -1, // Unlimited
    nodesPerAutomation: 5, // Limited to 5 per automation
    carouselTemplates: -1, // Unlimited
    buttonTemplates: -1, // Unlimited
    followerCheckNode: true,
    scheduledPosts: 20,
    analytics: "detailed" as const,
    analyticsRetentionDays: 90,
    prioritySupport: true,
    earlyAccess: false,
    apiAccess: false,
    showBranding: false,
  },
  ENTERPRISE: {
    name: "Pro",
    dmsPerDay: -1, // Unlimited
    smartAiPerDay: -1, // Unlimited
    smartAiTrialDays: -1,
    commentRepliesUnlimited: true,
    automations: -1, // Unlimited
    automationsLifetimeCap: false,
    maxActiveAutomations: -1, // Unlimited
    editsPerAutomation: -1, // Unlimited
    nodesPerAutomation: -1, // Unlimited
    carouselTemplates: -1, // Unlimited
    buttonTemplates: -1, // Unlimited
    followerCheckNode: true,
    scheduledPosts: -1, // Unlimited
    analytics: "detailed" as const,
    analyticsRetentionDays: 365,
    prioritySupport: true,
    earlyAccess: true,
    apiAccess: true,
    showBranding: false,
  },
};

export type PlanKey = keyof typeof PLAN_LIMITS;

/**
 * Get display name for a plan
 */
export function getPlanDisplayName(plan: PlanKey): string {
  return PLAN_LIMITS[plan].name;
}

/**
 * Get user's current plan and limits by email
 */
export async function getUserPlanLimitsByEmail(email: string) {
  const user = await client.user.findUnique({
    where: { email },
    include: { subscription: true },
  });

  const plan = (user?.subscription?.plan || "FREE") as PlanKey;
  return {
    plan,
    limits: PLAN_LIMITS[plan],
    subscription: user?.subscription,
  };
}

/**
 * Get user's current plan and limits (legacy — by userId)
 */
export async function getUserPlanLimits(userId: string) {
  const user = await client.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  const plan = (user?.subscription?.plan || "FREE") as PlanKey;
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
  action:
    | "create_automation"
    | "send_dm"
    | "schedule_post"
    | "use_ai"
    | "access_api"
    | "edit_automation",
  automationId?: string,
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
          reason: `${limits.name} plan limited to ${limits.automations} automations`,
          upgrade: plan === "FREE" ? "PRO" : "ENTERPRISE",
        };
      }
      return { allowed: true };
    }

    case "edit_automation": {
      if (limits.editsPerAutomation === -1) return { allowed: true };
      if (!automationId)
        return { allowed: false, reason: "Automation ID required" };

      const automation = await client.automation.findFirst({
        where: { id: automationId, User: { email } },
        select: { editCount: true, editCountResetAt: true },
      });

      if (!automation)
        return { allowed: false, reason: "Automation not found" };

      // For Starter (lifetime cap), no monthly reset — check absolute count
      if (limits.automationsLifetimeCap) {
        if (automation.editCount >= limits.editsPerAutomation) {
          return {
            allowed: false,
            reason: `Starter plan allows ${limits.editsPerAutomation} edit per automation. Upgrade to Plus for unlimited edits.`,
            upgrade: "PRO",
          };
        }
      } else {
        // Monthly reset for paid plans
        const now = new Date();
        const resetAt = automation.editCountResetAt;
        const currentCount =
          resetAt && resetAt > now ? automation.editCount : 0;

        if (currentCount >= limits.editsPerAutomation) {
          return {
            allowed: false,
            reason: `You've reached your monthly edit limit of ${limits.editsPerAutomation}`,
            upgrade: plan === "PRO" ? "ENTERPRISE" : "PRO",
          };
        }
      }

      return { allowed: true };
    }

    case "send_dm": {
      if (limits.dmsPerDay === -1) return { allowed: true };

      // Count DMs sent today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const dmCount = await client.dms.count({
        where: {
          Automation: { User: { email } },
          createdAt: { gte: startOfDay },
        },
      });

      if (dmCount >= limits.dmsPerDay) {
        return {
          allowed: false,
          reason: `You've reached your daily limit of ${limits.dmsPerDay} DMs`,
          upgrade: plan === "FREE" ? "PRO" : "ENTERPRISE",
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
          reason: `${limits.name} plan limited to ${limits.scheduledPosts} scheduled posts`,
          upgrade: plan === "FREE" ? "PRO" : "ENTERPRISE",
        };
      }
      return { allowed: true };
    }

    case "use_ai": {
      if (limits.smartAiPerDay === 0) {
        return {
          allowed: false,
          reason: "Smart AI requires Plus plan",
          upgrade: "PRO",
        };
      }
      return { allowed: true };
    }

    case "access_api": {
      if (!limits.apiAccess) {
        return {
          allowed: false,
          reason: "API access requires Pro plan",
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
 * Check if user can perform action (legacy — by userId)
 */
export async function canPerformAction(
  userId: string,
  action:
    | "create_automation"
    | "send_dm"
    | "schedule_post"
    | "use_ai"
    | "access_api"
    | "edit_automation",
  automationId?: string,
): Promise<{ allowed: boolean; reason?: string; upgrade?: string }> {
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) return { allowed: false, reason: "User not found" };
  return canPerformActionByEmail(user.email, action, automationId);
}

/**
 * Get user's current usage stats by email
 */
export async function getUserUsageByEmail(email: string) {
  const { limits } = await getUserPlanLimitsByEmail(email);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [dmCount, automationCount, scheduledCount] = await Promise.all([
    client.dms.count({
      where: {
        Automation: { User: { email } },
        createdAt: { gte: startOfDay },
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
      limit: limits.dmsPerDay,
      unlimited: limits.dmsPerDay === -1,
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
 * Get user's current usage stats (legacy — by userId)
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
      scheduledPosts: { used: 0, limit: 0, unlimited: false },
    };
  }

  return getUserUsageByEmail(user.email);
}
