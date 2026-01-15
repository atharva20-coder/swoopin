import axios from "axios";

/**
 * Instagram Creator Marketplace API
 * For brands to discover and evaluate Instagram creators for partnership ads
 *
 * Requirements:
 * - instagram_creator_marketplace_discovery (requires advanced access)
 * - instagram_basic
 * - pages_manage_metadata
 * - pages_show_list
 * - business_management
 *
 * Rate Limits:
 * - Account-level: 240 requests per user per hour
 * - App-level: 200 * Number of Effective Users per hour
 */

const BASE_URL = process.env.INSTAGRAM_BASE_URL;

// ============================================
// TYPES
// ============================================

export type CreatorAgeBucket =
  | "18_to_24"
  | "25_to_34"
  | "35_to_44"
  | "45_to_54"
  | "55_to_64"
  | "65_and_above";

export type CreatorInterest =
  | "ANIMALS_AND_PETS"
  | "BOOKS_AND_LITERATURE"
  | "BUSINESS_FINANCE_AND_ECONOMICS"
  | "EDUCATION_AND_LEARNING"
  | "BEAUTY"
  | "FASHION"
  | "FITNESS_AND_WORKOUTS"
  | "FOOD_AND_DRINK"
  | "GAMES_PUZZLES_AND_PLAY"
  | "HISTORY_AND_PHILOSOPHY"
  | "HOLIDAYS_AND_CELEBRATIONS"
  | "HOME_AND_GARDEN"
  | "MUSIC_AND_AUDIO"
  | "PERFORMING_ARTS"
  | "SCIENCE_AND_TECH"
  | "SPORTS"
  | "TV_AND_MOVIES"
  | "TRAVEL_AND_LEISURE_ACTIVITIES"
  | "VEHICLES_AND_TRANSPORTATION"
  | "VISUAL_ARTS_ARCHITECTURE_AND_CRAFTS";

export type CreatorGender = "male" | "female";

export type FollowerCountBucket = 0 | 10000 | 25000 | 50000 | 75000 | 100000;

export type EngagedAccountsBucket = 0 | 2000 | 10000 | 50000 | 100000;

export interface CreatorDiscoveryFilters {
  creator_countries?: string[];
  creator_min_followers?: FollowerCountBucket;
  creator_max_followers?: FollowerCountBucket;
  creator_age_bucket?: CreatorAgeBucket;
  creator_interests?: CreatorInterest[];
  creator_gender?: CreatorGender;
  creator_min_engaged_accounts?: EngagedAccountsBucket;
  creator_max_engaged_accounts?: EngagedAccountsBucket;
  major_audience_age_bucket?: CreatorAgeBucket;
  major_audience_gender?: CreatorGender;
  major_audience_countries?: string[];
  query?: string;
  similar_to_creators?: string[];
  username?: string;
  reels_interaction_rate?: number;
}

export interface CreatorProfile {
  id: string;
  username?: string;
  is_account_verified?: boolean;
  biography?: string;
  country?: string;
  gender?: CreatorGender;
  age_bucket?: CreatorAgeBucket;
  onboarded_status?: string;
  email?: string;
  portfolio_url?: string;
  has_brand_partnership_experience?: boolean;
  past_brand_partnership_partners?: string[];
  insights?: Record<string, unknown>;
}

export interface CreatorMedia {
  id: string;
  product_type?: string;
  media_type?: string;
  permalink?: string;
  creation_time?: string;
  caption?: string;
  tagged_brand?: string;
  likes?: number;
  comments?: number;
  views?: number;
  shares?: number;
}

export interface CreatorInsightsMetric {
  metric: string;
  value: number;
  breakdown?: Record<string, unknown>;
}

// ============================================
// DISCOVERY API
// ============================================

/**
 * Discover creators in the Instagram Creator Marketplace
 *
 * @param userId - Brand's Instagram user ID
 * @param token - Page Access Token
 * @param filters - Optional filters for discovery
 * @param fields - Fields to return (default: id,username,country,gender)
 */
export async function discoverCreators(
  userId: string,
  token: string,
  filters?: CreatorDiscoveryFilters,
  fields: string = "id,username,country,gender,is_account_verified,biography,onboarded_status"
): Promise<{
  success: boolean;
  data?: CreatorProfile[];
  paging?: { cursors?: { after?: string; before?: string }; next?: string };
  error?: string;
}> {
  try {
    const params: Record<string, string> = {
      fields,
    };

    // Add filter parameters
    if (filters) {
      if (filters.creator_countries) {
        params.creator_countries = JSON.stringify(filters.creator_countries);
      }
      if (filters.creator_min_followers !== undefined) {
        params.creator_min_followers = String(filters.creator_min_followers);
      }
      if (filters.creator_max_followers !== undefined) {
        params.creator_max_followers = String(filters.creator_max_followers);
      }
      if (filters.creator_age_bucket) {
        params.creator_age_bucket = filters.creator_age_bucket;
      }
      if (filters.creator_interests) {
        params.creator_interests = JSON.stringify(filters.creator_interests);
      }
      if (filters.creator_gender) {
        params.creator_gender = filters.creator_gender;
      }
      if (filters.creator_min_engaged_accounts !== undefined) {
        params.creator_min_engaged_accounts = String(
          filters.creator_min_engaged_accounts
        );
      }
      if (filters.creator_max_engaged_accounts !== undefined) {
        params.creator_max_engaged_accounts = String(
          filters.creator_max_engaged_accounts
        );
      }
      if (filters.major_audience_age_bucket) {
        params.major_audience_age_bucket = filters.major_audience_age_bucket;
      }
      if (filters.major_audience_gender) {
        params.major_audience_gender = filters.major_audience_gender;
      }
      if (filters.major_audience_countries) {
        params.major_audience_countries = JSON.stringify(
          filters.major_audience_countries
        );
      }
      if (filters.query) {
        params.query = filters.query;
      }
      if (filters.similar_to_creators) {
        params.similar_to_creators = JSON.stringify(
          filters.similar_to_creators
        );
      }
      if (filters.username) {
        params.username = filters.username;
      }
    }

    const response = await axios.get(
      `${BASE_URL}/v21.0/${userId}/creator_marketplace_creators`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data?.data || [],
      paging: response.data?.paging,
    };
  } catch (error) {
    console.error("Error discovering creators:", error);

    let errorMessage = "Failed to discover creators";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Search creators by keyword/query
 *
 * @param userId - Brand's Instagram user ID
 * @param query - Search query (keywords, username, content terms)
 * @param token - Page Access Token
 * @param additionalFilters - Additional filters to combine with query
 */
export async function searchCreators(
  userId: string,
  query: string,
  token: string,
  additionalFilters?: Omit<
    CreatorDiscoveryFilters,
    "query" | "similar_to_creators"
  >
): Promise<{
  success: boolean;
  data?: CreatorProfile[];
  error?: string;
}> {
  return discoverCreators(userId, token, { ...additionalFilters, query });
}

/**
 * Find similar creators based on existing creators
 *
 * @param userId - Brand's Instagram user ID
 * @param creatorUsernames - List of creator usernames (max 5)
 * @param token - Page Access Token
 */
export async function findSimilarCreators(
  userId: string,
  creatorUsernames: string[],
  token: string
): Promise<{
  success: boolean;
  data?: CreatorProfile[];
  error?: string;
}> {
  if (creatorUsernames.length > 5) {
    return { success: false, error: "Maximum 5 creator usernames allowed" };
  }

  return discoverCreators(userId, token, {
    similar_to_creators: creatorUsernames,
  });
}

/**
 * Get detailed creator profile by username
 *
 * @param userId - Brand's Instagram user ID
 * @param creatorUsername - Creator's Instagram username
 * @param token - Page Access Token
 */
export async function getCreatorProfile(
  userId: string,
  creatorUsername: string,
  token: string
): Promise<{
  success: boolean;
  data?: CreatorProfile & {
    branded_content_media?: CreatorMedia[];
    recent_media?: CreatorMedia[];
  };
  error?: string;
}> {
  try {
    const response = await axios.get(
      `${BASE_URL}/v21.0/${userId}/creator_marketplace_creators`,
      {
        params: {
          username: creatorUsername,
          fields:
            "id,username,is_account_verified,biography,country,gender,age_bucket,onboarded_status,email,portfolio_url,has_brand_partnership_experience,past_brand_partnership_partners,insights,branded_content_media{id,media_type,permalink,creation_time,caption,tagged_brand,likes,comments,views,shares},recent_media{id,media_type,permalink,creation_time,caption,likes,comments,views,shares}",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const creators = response.data?.data;
    if (!creators || creators.length === 0) {
      return { success: false, error: "Creator not found" };
    }

    return {
      success: true,
      data: creators[0],
    };
  } catch (error) {
    console.error("Error getting creator profile:", error);

    let errorMessage = "Failed to get creator profile";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}

// ============================================
// CREATOR INSIGHTS API
// ============================================

export type InsightMetric =
  | "total_followers"
  | "creator_engaged_accounts"
  | "creator_reach"
  | "reels_interaction_rate"
  | "reels_hook_rate";

export type InsightPeriod = "day" | "overall";

export type InsightTimeRange =
  | "this_week"
  | "last_14_days"
  | "this_month"
  | "last_90_days"
  | "lifetime";

export type InsightBreakdown =
  | "follow_type"
  | "gender"
  | "age"
  | "top_countries"
  | "top_cities"
  | "media_type";

/**
 * Get creator insights metrics
 *
 * @param userId - Brand's Instagram user ID
 * @param creatorUsername - Creator's Instagram username
 * @param metrics - Metrics to retrieve
 * @param token - Page Access Token
 * @param breakdown - Optional breakdown dimension
 */
export async function getCreatorInsights(
  userId: string,
  creatorUsername: string,
  metrics: InsightMetric[],
  token: string,
  breakdown?: InsightBreakdown
): Promise<{
  success: boolean;
  data?: {
    metrics: CreatorInsightsMetric[];
  };
  error?: string;
}> {
  try {
    let insightsField = `insights.metrics(${metrics.join(",")})`;
    if (breakdown) {
      insightsField += `.breakdown(${breakdown})`;
    }

    const response = await axios.get(
      `${BASE_URL}/v21.0/${userId}/creator_marketplace_creators`,
      {
        params: {
          username: creatorUsername,
          fields: insightsField,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const creators = response.data?.data;
    if (!creators || creators.length === 0) {
      return { success: false, error: "Creator not found" };
    }

    return {
      success: true,
      data: {
        metrics: creators[0].insights || [],
      },
    };
  } catch (error) {
    console.error("Error getting creator insights:", error);

    let errorMessage = "Failed to get creator insights";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Get creator's branded content and recent media with insights
 *
 * @param userId - Brand's Instagram user ID
 * @param creatorUsername - Creator's Instagram username
 * @param token - Page Access Token
 * @param mediaMetrics - Media metrics to retrieve (e.g., views, likes)
 */
export async function getCreatorMediaInsights(
  userId: string,
  creatorUsername: string,
  token: string,
  mediaMetrics: string[] = ["views", "likes", "comments", "shares"]
): Promise<{
  success: boolean;
  data?: {
    branded_content_media?: CreatorMedia[];
    recent_media?: CreatorMedia[];
  };
  error?: string;
}> {
  try {
    const metricsField = mediaMetrics.join(",");

    const response = await axios.get(
      `${BASE_URL}/v21.0/${userId}/creator_marketplace_creators`,
      {
        params: {
          username: creatorUsername,
          fields: `branded_content_media{id,media_type,permalink,creation_time,caption,tagged_brand,insights.metrics(${metricsField})},recent_media{id,media_type,permalink,creation_time,caption,insights.metrics(${metricsField})}`,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const creators = response.data?.data;
    if (!creators || creators.length === 0) {
      return { success: false, error: "Creator not found" };
    }

    return {
      success: true,
      data: {
        branded_content_media: creators[0].branded_content_media?.data,
        recent_media: creators[0].recent_media?.data,
      },
    };
  } catch (error) {
    console.error("Error getting creator media insights:", error);

    let errorMessage = "Failed to get creator media insights";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}
