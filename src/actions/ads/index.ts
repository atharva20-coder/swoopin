"use server";

import { client } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CampaignStatus, CampaignObjective } from "@prisma/client";
import { z } from "zod";
import {
  getCampaigns as getMetaCampaigns,
  createCampaign as createMetaCampaign,
  updateCampaignStatus as updateMetaStatus,
  getCampaignInsights as getMetaInsights,
  getAdAccounts,
  CreateCampaignSchema,
  type CreateCampaignInput,
} from "@/lib/instagram/ads";

// Helper to get current user's integration
async function getUserIntegration() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return null;
  }

  const integration = await client.integrations.findFirst({
    where: { userId: session.user.id },
    select: { token: true, instagramId: true, userId: true },
  });

  return integration;
}

/**
 * Get user's ad accounts
 */
export async function getUserAdAccounts() {
  try {
    const integration = await getUserIntegration();
    if (!integration?.token) {
      return { status: 401, data: "Unauthorized" };
    }

    const result = await getAdAccounts(integration.token);
    if (!result.success) {
      return { status: 500, data: result.error };
    }

    return { status: 200, data: result.adAccounts };
  } catch (error) {
    console.error("Error getting ad accounts:", error);
    return { status: 500, data: "Failed to get ad accounts" };
  }
}

/**
 * Get user's campaigns
 */
export async function getUserCampaigns() {
  try {
    const integration = await getUserIntegration();
    if (!integration) {
      return { status: 401, data: "Unauthorized" };
    }

    const campaigns = await client.adCampaign.findMany({
      where: { userId: integration.userId! },
      orderBy: { createdAt: "desc" },
    });

    return { status: 200, data: campaigns };
  } catch (error) {
    console.error("Error getting campaigns:", error);
    return { status: 500, data: "Failed to get campaigns" };
  }
}

/**
 * Sync campaigns from Meta
 */
export async function syncCampaigns(adAccountId: string) {
  try {
    const integration = await getUserIntegration();
    if (!integration?.token) {
      return { status: 400, data: "Instagram not connected" };
    }

    const result = await getMetaCampaigns(adAccountId, integration.token);
    if (!result.success) {
      return { status: 500, data: result.error };
    }

    // Sync to database
    for (const campaign of result.campaigns || []) {
      const budget = parseFloat(campaign.daily_budget || campaign.lifetime_budget || "0") / 100;
      
      await client.adCampaign.upsert({
        where: { id: campaign.id },
        create: {
          userId: integration.userId!,
          campaignId: campaign.id,
          adAccountId,
          name: campaign.name,
          objective: mapObjective(campaign.objective),
          status: mapStatus(campaign.status),
          budget,
          currency: "USD",
        },
        update: {
          name: campaign.name,
          objective: mapObjective(campaign.objective),
          status: mapStatus(campaign.status),
          budget,
        },
      });
    }

    return { status: 200, data: "Campaigns synced" };
  } catch (error) {
    console.error("Error syncing campaigns:", error);
    return { status: 500, data: "Failed to sync campaigns" };
  }
}

/**
 * Create a new campaign
 */
export async function createCampaign(adAccountId: string, data: CreateCampaignInput) {
  try {
    const integration = await getUserIntegration();
    if (!integration?.token) {
      return { status: 401, data: "Unauthorized" };
    }

    // Validate with Zod
    const validated = CreateCampaignSchema.parse(data);

    // Create on Meta
    const result = await createMetaCampaign(adAccountId, integration.token, validated);
    if (!result.success) {
      return { status: 500, data: result.error };
    }

    // Save to database
    const campaign = await client.adCampaign.create({
      data: {
        userId: integration.userId!,
        campaignId: result.campaignId!,
        adAccountId,
        name: validated.name,
        objective: validated.objective as CampaignObjective,
        status: "PAUSED",
        budget: validated.budget,
        currency: validated.currency,
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
      },
    });

    return { status: 200, data: campaign };
  } catch (error) {
    console.error("Error creating campaign:", error);
    
    if (error instanceof z.ZodError) {
      return { status: 400, data: error.errors[0].message };
    }
    
    return { status: 500, data: "Failed to create campaign" };
  }
}

/**
 * Update campaign status
 */
export async function updateCampaignStatus(
  campaignId: string,
  status: CampaignStatus
) {
  try {
    const integration = await getUserIntegration();
    if (!integration?.token) {
      return { status: 401, data: "Unauthorized" };
    }

    const campaign = await client.adCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.userId !== integration.userId) {
      return { status: 404, data: "Campaign not found" };
    }

    // Update on Meta
    await updateMetaStatus(campaign.campaignId, integration.token, status);

    // Update in database
    const updated = await client.adCampaign.update({
      where: { id: campaignId },
      data: { status },
    });

    return { status: 200, data: updated };
  } catch (error) {
    console.error("Error updating campaign:", error);
    return { status: 500, data: "Failed to update campaign" };
  }
}

/**
 * Get campaign insights
 */
export async function getCampaignInsights(campaignId: string) {
  try {
    const integration = await getUserIntegration();
    if (!integration?.token) {
      return { status: 401, data: "Unauthorized" };
    }

    const campaign = await client.adCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.userId !== integration.userId) {
      return { status: 404, data: "Campaign not found" };
    }

    const result = await getMetaInsights(campaign.campaignId, integration.token);
    if (!result.success) {
      return { status: 500, data: result.error };
    }

    // Update insights in database
    if (result.insights) {
      await client.adCampaign.update({
        where: { id: campaignId },
        data: { insights: result.insights as object },
      });
    }

    return { status: 200, data: result.insights };
  } catch (error) {
    console.error("Error getting insights:", error);
    return { status: 500, data: "Failed to get insights" };
  }
}

/**
 * Delete a campaign
 */
export async function deleteCampaign(campaignId: string) {
  try {
    const integration = await getUserIntegration();
    if (!integration?.token) {
      return { status: 401, data: "Unauthorized" };
    }

    const campaign = await client.adCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.userId !== integration.userId) {
      return { status: 404, data: "Campaign not found" };
    }

    // Update status on Meta to DELETED
    await updateMetaStatus(campaign.campaignId, integration.token, "DELETED");

    // Delete from database
    await client.adCampaign.delete({
      where: { id: campaignId },
    });

    return { status: 200, data: "Campaign deleted" };
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return { status: 500, data: "Failed to delete campaign" };
  }
}

// Helper functions
function mapObjective(objective: string): CampaignObjective {
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

function mapStatus(status: string): CampaignStatus {
  const mapping: Record<string, CampaignStatus> = {
    ACTIVE: "ACTIVE",
    PAUSED: "PAUSED",
    DELETED: "DELETED",
    ARCHIVED: "ARCHIVED",
  };
  return mapping[status] || "PAUSED";
}
