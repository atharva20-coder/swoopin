import axios from "axios";

/**
 * Instagram Business Discovery API
 * Get basic metadata and metrics about other Instagram professional accounts
 *
 * Limitations:
 * - Data about age-gated Instagram professional accounts will not be returned
 * - Only works with professional (Business/Creator) accounts
 */

const BASE_URL = process.env.INSTAGRAM_BASE_URL;

export interface BusinessDiscoveryProfile {
  id: string;
  username?: string;
  name?: string;
  biography?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  profile_picture_url?: string;
  website?: string;
}

export interface BusinessDiscoveryMedia {
  id: string;
  caption?: string;
  comments_count?: number;
  like_count?: number;
  view_count?: number;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  timestamp?: string;
  thumbnail_url?: string;
}

export interface BusinessDiscoveryResult {
  profile: BusinessDiscoveryProfile;
  media?: BusinessDiscoveryMedia[];
}

/**
 * Get basic profile info about another Instagram professional account
 *
 * @param userId - Your app user's Instagram user ID
 * @param targetUsername - Username of the account to discover (without @)
 * @param token - Access token
 */
export async function discoverBusinessProfile(
  userId: string,
  targetUsername: string,
  token: string
): Promise<{
  success: boolean;
  data?: BusinessDiscoveryProfile;
  error?: string;
}> {
  try {
    const response = await axios.get(`${BASE_URL}/v21.0/${userId}`, {
      params: {
        fields: `business_discovery.username(${targetUsername}){id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website}`,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const businessDiscovery = response.data?.business_discovery;
    if (!businessDiscovery) {
      return {
        success: false,
        error: "Profile not found or not a professional account",
      };
    }

    return {
      success: true,
      data: {
        id: businessDiscovery.id,
        username: businessDiscovery.username,
        name: businessDiscovery.name,
        biography: businessDiscovery.biography,
        followers_count: businessDiscovery.followers_count,
        follows_count: businessDiscovery.follows_count,
        media_count: businessDiscovery.media_count,
        profile_picture_url: businessDiscovery.profile_picture_url,
        website: businessDiscovery.website,
      },
    };
  } catch (error) {
    console.error("Error discovering business profile:", error);

    let errorMessage = "Failed to discover business profile";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Get follower and media count for another Instagram professional account
 *
 * @param userId - Your app user's Instagram user ID
 * @param targetUsername - Username of the account to discover
 * @param token - Access token
 */
export async function getBusinessMetrics(
  userId: string,
  targetUsername: string,
  token: string
): Promise<{
  success: boolean;
  data?: {
    id: string;
    followers_count: number;
    media_count: number;
  };
  error?: string;
}> {
  try {
    const response = await axios.get(`${BASE_URL}/v21.0/${userId}`, {
      params: {
        fields: `business_discovery.username(${targetUsername}){id,followers_count,media_count}`,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const businessDiscovery = response.data?.business_discovery;
    if (!businessDiscovery) {
      return { success: false, error: "Profile not found" };
    }

    return {
      success: true,
      data: {
        id: businessDiscovery.id,
        followers_count: businessDiscovery.followers_count || 0,
        media_count: businessDiscovery.media_count || 0,
      },
    };
  } catch (error) {
    console.error("Error getting business metrics:", error);

    let errorMessage = "Failed to get business metrics";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Get media from another Instagram professional account
 *
 * @param userId - Your app user's Instagram user ID
 * @param targetUsername - Username of the account to discover
 * @param token - Access token
 * @param limit - Max media items to return (default 25)
 */
export async function getBusinessMedia(
  userId: string,
  targetUsername: string,
  token: string,
  limit: number = 25
): Promise<{
  success: boolean;
  data?: BusinessDiscoveryMedia[];
  error?: string;
}> {
  try {
    const response = await axios.get(`${BASE_URL}/v21.0/${userId}`, {
      params: {
        fields: `business_discovery.username(${targetUsername}){media.limit(${limit}){id,caption,comments_count,like_count,view_count,media_type,media_url,permalink,timestamp,thumbnail_url}}`,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const businessDiscovery = response.data?.business_discovery;
    if (!businessDiscovery?.media?.data) {
      return { success: false, error: "No media found" };
    }

    return {
      success: true,
      data: businessDiscovery.media.data.map(
        (item: Record<string, unknown>) => ({
          id: item.id as string,
          caption: item.caption as string | undefined,
          comments_count: item.comments_count as number | undefined,
          like_count: item.like_count as number | undefined,
          view_count: item.view_count as number | undefined,
          media_type: item.media_type as string | undefined,
          media_url: item.media_url as string | undefined,
          permalink: item.permalink as string | undefined,
          timestamp: item.timestamp as string | undefined,
          thumbnail_url: item.thumbnail_url as string | undefined,
        })
      ),
    };
  } catch (error) {
    console.error("Error getting business media:", error);

    let errorMessage = "Failed to get business media";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Get full business discovery with profile and media
 * Combines profile info with recent media and engagement metrics
 *
 * @param userId - Your app user's Instagram user ID
 * @param targetUsername - Username of the account to discover
 * @param token - Access token
 * @param mediaLimit - Max media items to return (default 12)
 */
export async function discoverBusinessWithMedia(
  userId: string,
  targetUsername: string,
  token: string,
  mediaLimit: number = 12
): Promise<{
  success: boolean;
  data?: BusinessDiscoveryResult;
  error?: string;
}> {
  try {
    const response = await axios.get(`${BASE_URL}/v21.0/${userId}`, {
      params: {
        fields: `business_discovery.username(${targetUsername}){id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website,media.limit(${mediaLimit}){id,caption,comments_count,like_count,view_count,media_type,permalink,timestamp}}`,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const bd = response.data?.business_discovery;
    if (!bd) {
      return {
        success: false,
        error: "Profile not found or not a professional account",
      };
    }

    return {
      success: true,
      data: {
        profile: {
          id: bd.id,
          username: bd.username,
          name: bd.name,
          biography: bd.biography,
          followers_count: bd.followers_count,
          follows_count: bd.follows_count,
          media_count: bd.media_count,
          profile_picture_url: bd.profile_picture_url,
          website: bd.website,
        },
        media: bd.media?.data?.map((item: Record<string, unknown>) => ({
          id: item.id as string,
          caption: item.caption as string | undefined,
          comments_count: item.comments_count as number | undefined,
          like_count: item.like_count as number | undefined,
          view_count: item.view_count as number | undefined,
          media_type: item.media_type as string | undefined,
          permalink: item.permalink as string | undefined,
          timestamp: item.timestamp as string | undefined,
        })),
      },
    };
  } catch (error) {
    console.error("Error discovering business with media:", error);

    let errorMessage = "Failed to discover business";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}
