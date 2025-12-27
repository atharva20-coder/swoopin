"use server";

import axios from "axios";

// Types
export interface BrandedContentPartner {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
}

export interface BrandedContentAd {
  id: string;
  partner_id: string;
  partner_username: string;
  status: "pending" | "approved" | "rejected";
}

interface PartnersResponse {
  data: BrandedContentPartner[];
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
 * Get approved branded content partners
 */
export async function getBrandedContentPartners(
  instagramAccountId: string,
  accessToken: string
): Promise<{ success: boolean; partners?: BrandedContentPartner[]; error?: string }> {
  try {
    const response = await axios.get<PartnersResponse>(
      `${getBaseUrl()}/${instagramAccountId}/branded_content_ad_partners`,
      {
        params: {
          fields: "id,username,name,profile_picture_url",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return { success: true, partners: response.data.data || [] };
  } catch (error) {
    console.error("Error fetching branded content partners:", error);

    let errorMessage = "Failed to fetch partners";
    if (axios.isAxiosError(error)) {
      // 400/403 often means permission not granted
      if (error.response?.status === 400 || error.response?.status === 403) {
        return { success: true, partners: [] }; // Return empty gracefully
      }
      errorMessage = error.response?.data?.error?.message || error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Approve a creator for branded content partnership
 */
export async function approveBrandedContent(
  instagramAccountId: string,
  accessToken: string,
  creatorId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await axios.post(
      `${getBaseUrl()}/${instagramAccountId}/branded_content_ad_partners`,
      {
        branded_content_creator_id: creatorId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Error approving branded content:", error);

    let errorMessage = "Failed to approve partnership";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Request branded content partnership with a brand
 */
export async function requestBrandedContent(
  instagramAccountId: string,
  accessToken: string,
  brandId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await axios.post(
      `${getBaseUrl()}/${instagramAccountId}/branded_content_tag_requests`,
      {
        sponsor_id: brandId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Error requesting branded content:", error);

    let errorMessage = "Failed to request partnership";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Remove a branded content partner
 */
export async function removeBrandedContentPartner(
  instagramAccountId: string,
  accessToken: string,
  partnerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await axios.delete(
      `${getBaseUrl()}/${instagramAccountId}/branded_content_ad_partners`,
      {
        params: {
          branded_content_creator_id: partnerId,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Error removing branded content partner:", error);

    let errorMessage = "Failed to remove partner";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    }

    return { success: false, error: errorMessage };
  }
}
