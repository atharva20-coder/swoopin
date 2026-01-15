import { useQuery } from "@tanstack/react-query";
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
  status: z.number(),
  data: z.array(AutomationListItemSchema).default([]),
});

// Standard API response wrapper for single automation
const AutomationApiResponseSchema = z.object({
  status: z.number(),
  data: AutomationDetailResponseSchema.optional(),
});

// Standard API response wrapper for user profile
const UserProfileApiResponseSchema = z.object({
  status: z.number(),
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
const InstagramProfileApiResponseSchema = z.object({
  status: z.number(),
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

// Standard API response wrapper for posts
// Following Zero-Patchwork Protocol: Transform nullish to empty strings at schema layer
const PostsApiResponseSchema = z.object({
  status: z.number(),
  data: z
    .array(
      z.object({
        id: z.string(),
        // Transform undefined/null to empty string - normalization at gateway
        media_url: z
          .string()
          .nullish()
          .transform((v) => v ?? ""),
        // Use enum to match InstagramPostProps type
        media_type: z.enum(["IMAGE", "VIDEO", "CAROUSEL_ALBUM"]),
        // Transform undefined/null to empty string - normalization at gateway
        caption: z
          .string()
          .nullish()
          .transform((v) => v ?? ""),
        timestamp: z.string(),
      })
    )
    .default([]),
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
  // Parse and transform at the gateway - schema handles all normalizations
  return AutomationsApiResponseSchema.parse(json);
}

async function fetchAutomationInfo(id: string): Promise<AutomationApiResponse> {
  const res = await fetch(`/api/v1/automations/${id}`);
  const json = await res.json();
  // Parse and transform at the gateway - schema handles all normalizations
  return AutomationApiResponseSchema.parse(json);
}

async function fetchProfilePosts(): Promise<PostsApiResponse> {
  const res = await fetch("/api/v1/posts");
  const json = await res.json();
  return PostsApiResponseSchema.parse(json);
}

async function fetchUserProfile(): Promise<UserProfileApiResponse> {
  const res = await fetch("/api/v1/user/profile");
  const json = await res.json();
  return UserProfileApiResponseSchema.parse(json);
}

async function fetchInstagramProfile(): Promise<InstagramProfileApiResponse> {
  const res = await fetch("/api/v1/integrations/instagram");
  const json = await res.json();
  return InstagramProfileApiResponseSchema.parse(json);
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

// Re-export types for consumers
export type { AutomationListItem, AutomationDetail };
