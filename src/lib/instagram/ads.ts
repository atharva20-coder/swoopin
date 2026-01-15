/**
 * Instagram Ads API Library
 * This is a regular module (not a Server Action file)
 */

import axios from "axios";
import { z } from "zod";

// Zod Schemas for validation
export const CreateCampaignSchema = z.object({
  name: z.string().min(1).max(100),
  objective: z.enum([
    "BRAND_AWARENESS",
    "REACH",
    "TRAFFIC",
    "ENGAGEMENT",
    "CONVERSIONS",
    "POST_ENGAGEMENT",
  ]),
  budget: z.number().positive(),
  currency: z.string().default("USD"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const BoostPostSchema = z.object({
  mediaId: z.string().min(1),
  budget: z.number().positive().min(1),
  duration: z.number().int().positive().max(30), // days
});

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;
export type BoostPostInput = z.infer<typeof BoostPostSchema>;

// Types
export interface AdCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  effective_status: string;
  daily_budget?: string;
  lifetime_budget?: string;
  created_time: string;
  updated_time: string;
}

export interface AdInsights {
  impressions: number;
  reach: number;
  clicks: number;
  spend: string;
  cpc: string;
  cpm: string;
  ctr: string;
  actions?: Array<{ action_type: string; value: string }>;
}

interface CampaignsResponse {
  data: AdCampaign[];
  paging?: {
    cursors: { before: string; after: string };
    next?: string;
  };
}

const getBaseUrl = () => {
  const baseUrl = process.env.INSTAGRAM_BASE_URL;
  if (!baseUrl) {
    throw new Error("INSTAGRAM_BASE_URL environment variable is not set");
  }
  return baseUrl;
};

/**
 * Get ad campaigns for an ad account
 */
export async function getCampaigns(
  adAccountId: string,
  accessToken: string,
  options?: { limit?: number; after?: string }
): Promise<{
  success: boolean;
  campaigns?: AdCampaign[];
  nextCursor?: string;
  error?: string;
}> {
  try {
    const params: Record<string, string> = {
      fields:
        "id,name,objective,status,effective_status,daily_budget,lifetime_budget,created_time,updated_time",
      limit: (options?.limit || 50).toString(),
    };

    if (options?.after) {
      params.after = options.after;
    }

    const response = await axios.get<CampaignsResponse>(
      `${getBaseUrl()}/act_${adAccountId}/campaigns`,
      {
        params,
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return {
      success: true,
      campaigns: response.data.data || [],
      nextCursor: response.data.paging?.cursors?.after,
    };
  } catch (error) {
    console.error("Error fetching campaigns:", error);

    let errorMessage = "Failed to fetch campaigns";
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400 || error.response?.status === 403) {
        return { success: true, campaigns: [] };
      }
      errorMessage = error.response?.data?.error?.message || error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Create a new ad campaign
 */
export async function createCampaign(
  adAccountId: string,
  accessToken: string,
  data: CreateCampaignInput
): Promise<{ success: boolean; campaignId?: string; error?: string }> {
  try {
    // Validate input
    const validated = CreateCampaignSchema.parse(data);

    const response = await axios.post(
      `${getBaseUrl()}/act_${adAccountId}/campaigns`,
      {
        name: validated.name,
        objective: validated.objective,
        status: "PAUSED",
        special_ad_categories: [],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true, campaignId: response.data.id };
  } catch (error) {
    console.error("Error creating campaign:", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }

    let errorMessage = "Failed to create campaign";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Update campaign status
 */
export async function updateCampaignStatus(
  campaignId: string,
  accessToken: string,
  status: "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED"
): Promise<{ success: boolean; error?: string }> {
  try {
    await axios.post(
      `${getBaseUrl()}/${campaignId}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating campaign status:", error);

    let errorMessage = "Failed to update campaign";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Get campaign insights
 */
export async function getCampaignInsights(
  campaignId: string,
  accessToken: string,
  datePreset: string = "last_7d"
): Promise<{ success: boolean; insights?: AdInsights; error?: string }> {
  try {
    const response = await axios.get(`${getBaseUrl()}/${campaignId}/insights`, {
      params: {
        fields: "impressions,reach,clicks,spend,cpc,cpm,ctr,actions",
        date_preset: datePreset,
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = response.data.data?.[0];
    if (!data) {
      return { success: true, insights: undefined };
    }

    return {
      success: true,
      insights: {
        impressions: parseInt(data.impressions || "0"),
        reach: parseInt(data.reach || "0"),
        clicks: parseInt(data.clicks || "0"),
        spend: data.spend || "0",
        cpc: data.cpc || "0",
        cpm: data.cpm || "0",
        ctr: data.ctr || "0",
        actions: data.actions,
      },
    };
  } catch (error) {
    console.error("Error fetching campaign insights:", error);

    let errorMessage = "Failed to fetch insights";
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        return { success: true, insights: undefined };
      }
      errorMessage = error.response?.data?.error?.message || error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Boost an Instagram post
 */
export async function boostPost(
  adAccountId: string,
  accessToken: string,
  data: BoostPostInput
): Promise<{ success: boolean; promotionId?: string; error?: string }> {
  try {
    // Validate input
    const validated = BoostPostSchema.parse(data);

    // Create a promotion for the post
    const response = await axios.post(
      `${getBaseUrl()}/act_${adAccountId}/adcreatives`,
      {
        object_story_id: validated.mediaId,
        call_to_action_type: "LEARN_MORE",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true, promotionId: response.data.id };
  } catch (error) {
    console.error("Error boosting post:", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }

    let errorMessage = "Failed to boost post";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Get ad accounts for a user
 */
export async function getAdAccounts(
  accessToken: string
): Promise<{
  success: boolean;
  adAccounts?: Array<{ id: string; name: string; currency: string }>;
  error?: string;
}> {
  try {
    const response = await axios.get(`${getBaseUrl()}/me/adaccounts`, {
      params: {
        fields: "id,name,currency",
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      success: true,
      adAccounts: response.data.data || [],
    };
  } catch (error) {
    console.error("Error fetching ad accounts:", error);

    let errorMessage = "Failed to fetch ad accounts";
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400 || error.response?.status === 403) {
        return { success: true, adAccounts: [] };
      }
      errorMessage = error.response?.data?.error?.message || error.message;
    }

    return { success: false, error: errorMessage };
  }
}
