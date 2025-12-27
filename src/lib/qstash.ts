import { Client } from "@upstash/qstash";

// Initialize QStash client
const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

/**
 * Schedule a background job
 */
export async function scheduleJob(
  url: string,
  data: Record<string, unknown>,
  options?: {
    delay?: number; // seconds
    retries?: number;
    callback?: string;
  }
) {
  try {
    const result = await qstashClient.publishJSON({
      url,
      body: data,
      delay: options?.delay,
      retries: options?.retries || 3,
      callback: options?.callback,
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("QStash publish error:", error);
    return { success: false, error: "Failed to schedule job" };
  }
}

/**
 * Schedule catalog sync (runs every hour)
 */
export async function scheduleCatalogSync(userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  return scheduleJob(
    `${baseUrl}/api/jobs/catalog-sync`,
    { userId },
    { delay: 3600 } // 1 hour
  );
}

/**
 * Schedule campaign insights refresh
 */
export async function scheduleCampaignInsightsRefresh(userId: string, campaignId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  return scheduleJob(
    `${baseUrl}/api/jobs/campaign-insights`,
    { userId, campaignId },
    { delay: 1800 } // 30 minutes
  );
}

/**
 * Schedule partnership sync
 */
export async function schedulePartnershipSync(userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  return scheduleJob(
    `${baseUrl}/api/jobs/partnership-sync`,
    { userId },
    { delay: 7200 } // 2 hours
  );
}

export { qstashClient };
