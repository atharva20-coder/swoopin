import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  AutomationListItemSchema,
  AutomationDetailResponseSchema,
  type AutomationListItem,
  type AutomationDetail,
} from "@/schemas/automation.schema";

/**
 * ============================================
 * API RESPONSE WRAPPER SCHEMAS
 * Following Zero-Patchwork Protocol:
 * - Parse at the gateway, keep core pure
 * - All normalization happens via Zod transforms
 * ============================================
 */

// Standard API response wrapper for list endpoints
const AutomationsApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(AutomationListItemSchema).default([]),
  meta: z
    .object({
      version: z.string().optional(),
      cursor: z.string().nullish(),
      hasMore: z.boolean().optional(),
    })
    .optional(),
});

// Standard API response wrapper for single automation
const AutomationApiResponseSchema = z.object({
  success: z.boolean(),
  data: AutomationDetailResponseSchema.optional(),
});

// Standard API response wrapper for user profile
// Handles both success and error responses gracefully
const UserProfileApiResponseSchema = z.object({
  status: z.number().optional(),
  success: z.boolean().optional(),
  error: z.string().optional(),
  data: z
    .object({
      id: z.string(),
      email: z.string().email(),
      firstname: z
        .string()
        .nullish()
        .transform((v) => v ?? null),
      lastname: z
        .string()
        .nullish()
        .transform((v) => v ?? null),
      createdAt: z.coerce.date(),
      subscription: z
        .object({
          plan: z.string(),
        })
        .nullish()
        .transform((v) => v ?? null),
    })
    .optional(),
});

// Standard API response wrapper for Instagram profile
// Field names match the response from getInstagramUserProfile in fetch.ts
// Handles both success and error responses gracefully
const InstagramProfileApiResponseSchema = z.object({
  status: z.number().optional(),
  success: z.boolean().optional(),
  error: z.string().optional(),
  data: z
    .object({
      id: z.string().optional(),
      followers_count: z.number().optional(),
      follower_count: z.number().optional(),
      following_count: z.number().optional(),
      media_count: z.number().optional(),
      username: z.string().optional(),
      name: z
        .string()
        .nullish()
        .transform((v) => v ?? null),
      // API returns profile_pic (mapped from profile_picture_url in fetch.ts)
      profile_pic: z
        .string()
        .nullish()
        .transform((v) => v ?? null),
      biography: z
        .string()
        .nullish()
        .transform((v) => v ?? null),
      // Additional fields from InstagramProfile type in fetch.ts
      is_verified_user: z.boolean().optional(),
      is_user_follow_business: z.boolean().optional(),
      is_business_follow_user: z.boolean().optional(),
    })
    .optional(),
});

// Single post item schema (shared for list and paginated responses)
const InstagramPostItemSchema = z.object({
  id: z.string(),
  media_url: z.string().nullish().transform((v) => v ?? ""),
  media_type: z.enum(["IMAGE", "VIDEO", "CAROUSEL_ALBUM"]),
  caption: z.string().nullish().transform((v) => v ?? ""),
  timestamp: z.string(),
});

// Standard API response wrapper for posts (supports optional pagination meta)
const PostsApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(InstagramPostItemSchema).default([]),
  meta: z
    .object({
      after: z.string().optional(),
      hasMore: z.boolean().optional(),
    })
    .optional(),
});

// Inferred types from schemas
export type AutomationsApiResponse = z.infer<
  typeof AutomationsApiResponseSchema
>;
export type AutomationApiResponse = z.infer<typeof AutomationApiResponseSchema>;
export type UserProfileApiResponse = z.infer<
  typeof UserProfileApiResponseSchema
>;
export type InstagramProfileApiResponse = z.infer<
  typeof InstagramProfileApiResponseSchema
>;
export type PostsApiResponse = z.infer<typeof PostsApiResponseSchema>;

/**
 * ============================================
 * REST API FETCHERS WITH ZOD VALIDATION
 * Data is validated and transformed at the gateway
 * ============================================
 */

async function fetchAllAutomations(): Promise<AutomationsApiResponse> {
  const res = await fetch("/api/v1/automations");
  const json = await res.json();
  console.log(
    "[DEBUG] fetchAllAutomations raw response:",
    JSON.stringify(json, null, 2),
  );
  // Parse and transform at the gateway - schema handles all normalizations
  const parsed = AutomationsApiResponseSchema.safeParse(json);
  if (!parsed.success) {
    console.error(
      "[DEBUG] fetchAllAutomations Zod parse error:",
      parsed.error.format(),
    );
    // Return empty response on parse error
    return { success: false, data: [] };
  }
  return parsed.data;
}

async function fetchAutomationInfo(id: string): Promise<AutomationApiResponse> {
  const res = await fetch(`/api/v1/automations/${id}`);
  const json = await res.json();
  // safeParse to gracefully handle API errors (401, 404, etc.)
  const parsed = AutomationApiResponseSchema.safeParse(json);
  if (!parsed.success) {
    console.error(
      "[DEBUG] fetchAutomationInfo Zod parse error:",
      parsed.error.format(),
    );
    return { success: false, data: undefined };
  }
  return parsed.data;
}

const INSTAGRAM_MEDIA_PAGE_SIZE = 50;

async function fetchProfilePosts(): Promise<PostsApiResponse> {
  const res = await fetch(
    `/api/v1/instagram/media?limit=${INSTAGRAM_MEDIA_PAGE_SIZE}`,
  );
  const json = await res.json();
  const parsed = PostsApiResponseSchema.safeParse(json);
  if (!parsed.success) {
    console.error(
      "[DEBUG] fetchProfilePosts Zod parse error:",
      parsed.error.format(),
    );
    return { success: false, data: [] };
  }
  return parsed.data;
}

async function fetchProfilePostsPage(
  pageParam: string | undefined,
): Promise<PostsApiResponse> {
  const url = new URL("/api/v1/instagram/media", window.location.origin);
  url.searchParams.set("limit", String(INSTAGRAM_MEDIA_PAGE_SIZE));
  if (pageParam) {
    url.searchParams.set("after", pageParam);
  }
  const res = await fetch(url.toString());
  const json = await res.json();
  const parsed = PostsApiResponseSchema.safeParse(json);
  if (!parsed.success) {
    console.error(
      "[DEBUG] fetchProfilePostsPage Zod parse error:",
      parsed.error.format(),
    );
    return { success: false, data: [] };
  }
  return parsed.data;
}

async function fetchUserProfile(): Promise<UserProfileApiResponse> {
  const res = await fetch("/api/v1/users/me");
  const json = await res.json();
  // safeParse to gracefully handle API errors
  const parsed = UserProfileApiResponseSchema.safeParse(json);
  if (!parsed.success) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[DEBUG] fetchUserProfile parse warning:",
        parsed.error.format(),
      );
    }
    return { status: 500, data: undefined };
  }
  return parsed.data;
}

async function fetchInstagramProfile(): Promise<InstagramProfileApiResponse> {
  const res = await fetch("/api/v1/integrations/instagram");
  const json = await res.json();
  // safeParse to gracefully handle API errors
  const parsed = InstagramProfileApiResponseSchema.safeParse(json);
  if (!parsed.success) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[DEBUG] fetchInstagramProfile parse warning:",
        parsed.error.format(),
      );
    }
    return { status: 500, data: undefined };
  }
  return parsed.data;
}

/**
 * ============================================
 * REACT QUERY HOOKS
 * Return fully typed, Zod-validated data
 * ============================================
 */

export const useQueryAutomations = (config?: { refetchInterval?: number }) => {
  return useQuery<AutomationsApiResponse>({
    queryKey: ["user-automations"],
    queryFn: fetchAllAutomations,
    ...config,
  });
};

export const useQueryAutomation = (id: string) => {
  return useQuery<AutomationApiResponse>({
    queryKey: ["automation-info", id],
    queryFn: () => fetchAutomationInfo(id),
    staleTime: 30 * 1000, // Cache for 30 seconds to prevent infinite refetches
  });
};

export const useQueryUser = () => {
  return useQuery<UserProfileApiResponse>({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
  });
};

export const useQueryAutomationPosts = () => {
  return useQuery<PostsApiResponse>({
    queryKey: ["instagram-media"],
    queryFn: fetchProfilePosts,
  });
};

/**
 * Infinite query for Instagram media (supports 500+ posts with "Load more").
 * Use in config panel / post picker for full account media with pagination.
 */
export const useInfiniteQueryInstagramMedia = () => {
  return useInfiniteQuery({
    queryKey: ["instagram-media-infinite"],
    queryFn: ({ pageParam }) => fetchProfilePostsPage(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.meta;
      if (meta?.hasMore && meta?.after) return meta.after;
      return undefined;
    },
    staleTime: 60 * 1000,
  });
};

export const useQueryInstagramProfile = () => {
  return useQuery<InstagramProfileApiResponse>({
    queryKey: ["instagram-profile"],
    queryFn: fetchInstagramProfile,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useQueryOnboardingProfile = () => {
  return useQuery({
    queryKey: ["onboarding-profile"],
    queryFn: async () => {
      const res = await fetch("/api/onboarding");
      const data = await res.json();
      if (data.status === 200 && data.data) {
        return data.data;
      }
      return null;
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
};

/**
 * ============================================
 * YOUTUBE VIDEOS QUERY
 * Following Zero-Patchwork Protocol
 * ============================================
 */

// YouTube Video Schema - normalize at gateway
const YouTubeVideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z
    .string()
    .nullish()
    .transform((v) => v ?? ""),
  thumbnail: z
    .string()
    .nullish()
    .transform((v) => v ?? ""),
  publishedAt: z.string(),
});

const YouTubeVideosApiResponseSchema = z.object({
  status: z.number().optional(),
  data: z
    .object({
      videos: z.array(YouTubeVideoSchema).default([]),
    })
    .optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});

export type YouTubeVideosApiResponse = z.infer<
  typeof YouTubeVideosApiResponseSchema
>;

async function fetchYouTubeVideos(): Promise<YouTubeVideosApiResponse> {
  const res = await fetch("/api/v1/integrations/youtube/videos");
  const json = await res.json();
  // Validate at gateway
  const parsed = YouTubeVideosApiResponseSchema.safeParse(json);
  if (!parsed.success) {
    console.warn(
      "[DEBUG] fetchYouTubeVideos parse warning:",
      parsed.error.format(),
    );
    return { data: { videos: [] } };
  }
  return parsed.data;
}

export const useQueryYouTubeVideos = (enabled: boolean = true) => {
  return useQuery<YouTubeVideosApiResponse>({
    queryKey: ["youtube-videos"],
    queryFn: fetchYouTubeVideos,
    enabled, // Only fetch when enabled
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Re-export types for consumers
export type { AutomationListItem, AutomationDetail };
