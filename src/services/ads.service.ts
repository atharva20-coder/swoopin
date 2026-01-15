import { client } from "@/lib/prisma";
import {
  getCampaigns as getMetaCampaigns,
  createCampaign as createMetaCampaign,
  updateCampaignStatus as updateMetaStatus,
  getCampaignInsights as getMetaInsights,
  getAdAccounts,
} from "@/lib/instagram/ads";
import {
  CampaignListSchema,
  AdAccountListSchema,
  AdInsightsSchema,
  AdInsightsForPrismaSchema,
  type Campaign,
  type AdAccount,
  type CreateCampaignRequest,
  type CampaignStatus,
  type CampaignObjective,
  type AdInsights,
} from "@/schemas/ads.schema";

/**
 * ============================================
 * ADS SERVICE
 * Business logic for ad campaigns
 * IDOR protection via userId ownership checks
 * Zero patchwork - all transformations via Zod schemas
 * ============================================
 */

class AdsService {
  /**
   * Get user's ad accounts
   */
  async getAdAccounts(
    userId: string
  ): Promise<AdAccount[] | { error: string }> {
    const integration = await client.integrations.findFirst({
      where: { userId, name: "INSTAGRAM" },
    });

    if (!integration?.token) {
      return { error: "Instagram not connected" };
    }

    const result = await getAdAccounts(integration.token);
    if (!result.success) {
      return { error: result.error || "Failed to get ad accounts" };
    }

    const validated = AdAccountListSchema.safeParse(result.adAccounts);
    return validated.success ? validated.data : [];
  }

  /**
   * Get user's campaigns
   * IDOR: Only returns campaigns owned by userId
   */
  async getCampaigns(userId: string): Promise<Campaign[]> {
    const campaigns = await client.adCampaign.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const validated = CampaignListSchema.safeParse(campaigns);
    return validated.success ? validated.data : [];
  }

  /**
   * Sync campaigns from Meta
   */
  async syncCampaigns(
    userId: string,
    adAccountId: string
  ): Promise<{ synced: boolean; count: number } | { error: string }> {
    const integration = await client.integrations.findFirst({
      where: { userId, name: "INSTAGRAM" },
    });

    if (!integration?.token) {
      return { error: "Instagram not connected" };
    }

    const result = await getMetaCampaigns(adAccountId, integration.token);
    if (!result.success) {
      return { error: result.error || "Failed to fetch campaigns" };
    }

    let count = 0;
    for (const campaign of result.campaigns || []) {
      const budget =
        parseFloat(campaign.daily_budget || campaign.lifetime_budget || "0") /
        100;

      await client.adCampaign.upsert({
        where: { id: campaign.id },
        create: {
          userId,
          campaignId: campaign.id,
          adAccountId,
          name: campaign.name,
          objective: this.mapObjective(campaign.objective),
          status: this.mapStatus(campaign.status),
          budget,
          currency: "USD",
        },
        update: {
          name: campaign.name,
          objective: this.mapObjective(campaign.objective),
          status: this.mapStatus(campaign.status),
          budget,
        },
      });
      count++;
    }

    return { synced: true, count };
  }

  /**
   * Create a new campaign
   */
  async createCampaign(
    userId: string,
    input: CreateCampaignRequest
  ): Promise<Campaign | { error: string }> {
    const integration = await client.integrations.findFirst({
      where: { userId, name: "INSTAGRAM" },
    });

    if (!integration?.token) {
      return { error: "Instagram not connected" };
    }

    const result = await createMetaCampaign(
      input.adAccountId,
      integration.token,
      {
        name: input.name,
        objective: input.objective,
        budget: input.budget,
        currency: input.currency,
        startDate: input.startDate?.toISOString(),
        endDate: input.endDate?.toISOString(),
      }
    );

    if (!result.success || !result.campaignId) {
      return { error: result.error || "Failed to create campaign" };
    }

    const campaign = await client.adCampaign.create({
      data: {
        userId,
        campaignId: result.campaignId,
        adAccountId: input.adAccountId,
        name: input.name,
        objective: input.objective,
        status: "PAUSED",
        budget: input.budget,
        currency: input.currency,
        startDate: input.startDate,
        endDate: input.endDate,
      },
    });

    const validated = CampaignListSchema.safeParse([campaign]);
    if (!validated.success || !validated.data[0]) {
      return { error: "Validation failed" };
    }

    return validated.data[0];
  }

  /**
   * Update campaign status
   * IDOR: Verifies campaign belongs to user
   */
  async updateCampaignStatus(
    userId: string,
    campaignId: string,
    status: CampaignStatus
  ): Promise<Campaign | { error: string }> {
    const campaign = await client.adCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.userId !== userId) {
      return { error: "Campaign not found" };
    }

    const integration = await client.integrations.findFirst({
      where: { userId, name: "INSTAGRAM" },
    });

    if (integration?.token) {
      try {
        await updateMetaStatus(campaign.campaignId, integration.token, status);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Meta campaign status update failed:", error.message);
        }
      }
    }

    const updated = await client.adCampaign.update({
      where: { id: campaignId },
      data: { status },
    });

    const validated = CampaignListSchema.safeParse([updated]);
    return validated.success && validated.data[0]
      ? validated.data[0]
      : { error: "Validation failed" };
  }

  /**
   * Get campaign insights
   * IDOR: Verifies campaign belongs to user
   * Uses Zod schema transformation for Prisma JSON compatibility
   */
  async getCampaignInsights(
    userId: string,
    campaignId: string
  ): Promise<AdInsights | null | { error: string }> {
    const campaign = await client.adCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.userId !== userId) {
      return { error: "Campaign not found" };
    }

    const integration = await client.integrations.findFirst({
      where: { userId, name: "INSTAGRAM" },
    });

    if (!integration?.token) {
      return { error: "Instagram not connected" };
    }

    const result = await getMetaInsights(
      campaign.campaignId,
      integration.token
    );

    if (!result.success) {
      return { error: result.error || "Failed to get insights" };
    }

    if (!result.insights) {
      return null;
    }

    // Validate through Zod schema - zero patchwork
    const insightsValidation = AdInsightsSchema.safeParse(result.insights);
    if (!insightsValidation.success) {
      console.error(
        "Insights validation failed:",
        insightsValidation.error.format()
      );
      return null;
    }

    // Transform for Prisma using schema transformer
    const prismaData = AdInsightsForPrismaSchema.safeParse(result.insights);
    if (prismaData.success) {
      await client.adCampaign.update({
        where: { id: campaignId },
        data: { insights: prismaData.data },
      });
    }

    return insightsValidation.data;
  }

  /**
   * Delete campaign
   * IDOR: Verifies campaign belongs to user
   */
  async deleteCampaign(userId: string, campaignId: string): Promise<boolean> {
    const campaign = await client.adCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.userId !== userId) {
      return false;
    }

    const integration = await client.integrations.findFirst({
      where: { userId, name: "INSTAGRAM" },
    });

    if (integration?.token) {
      try {
        await updateMetaStatus(
          campaign.campaignId,
          integration.token,
          "DELETED"
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Meta campaign delete failed:", error.message);
        }
      }
    }

    await client.adCampaign.delete({ where: { id: campaignId } });
    return true;
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private mapObjective(objective: string): CampaignObjective {
    const mapping: Record<string, CampaignObjective> = {
      BRAND_AWARENESS: "BRAND_AWARENESS",
      REACH: "REACH",
      TRAFFIC: "TRAFFIC",
      ENGAGEMENT: "ENGAGEMENT",
      CONVERSIONS: "CONVERSIONS",
      POST_ENGAGEMENT: "POST_ENGAGEMENT",
    };
    return mapping[objective] || "ENGAGEMENT";
  }

  private mapStatus(status: string): CampaignStatus {
    const mapping: Record<string, CampaignStatus> = {
      ACTIVE: "ACTIVE",
      PAUSED: "PAUSED",
      DELETED: "DELETED",
      ARCHIVED: "ARCHIVED",
    };
    return mapping[status] || "PAUSED";
  }
}

export const adsService = new AdsService();
