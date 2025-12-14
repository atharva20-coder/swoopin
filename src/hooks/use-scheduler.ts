import { useQuery } from "@tanstack/react-query";
import { useMutationData } from "./use-mutation-data";
import {
  getScheduledPosts,
  createScheduledPost,
  updateScheduledPost,
  deleteScheduledPost,
  publishScheduledPost,
  checkPublishingLimit,
  getContentDrafts,
  createDraft,
  updateDraft,
  deleteDraft,
} from "@/actions/scheduler";

/**
 * Query hook for fetching scheduled posts
 */
export const useQueryScheduledPosts = (options?: {
  status?: "SCHEDULED" | "POSTED" | "FAILED" | "CANCELLED";
  fromDate?: Date;
  toDate?: Date;
  refetchInterval?: number;
}) => {
  return useQuery({
    queryKey: ["scheduled-posts", options?.status, options?.fromDate, options?.toDate],
    queryFn: () => getScheduledPosts({
      status: options?.status,
      fromDate: options?.fromDate,
      toDate: options?.toDate,
    }),
    refetchInterval: options?.refetchInterval,
  });
};

/**
 * Mutation hook for creating a scheduled post
 */
export const useCreateScheduledPost = () => {
  return useMutationData(
    ["create-scheduled-post"],
    (data: {
      caption?: string;
      mediaUrl?: string;
      mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL";
      postType?: "POST" | "REEL" | "STORY";
      scheduledFor: Date;
      hashtags?: string[];
      automationId?: string;
      carouselItems?: { imageUrl?: string; videoUrl?: string }[];
      altText?: string;
    }) => createScheduledPost(data),
    "scheduled-posts"
  );
};

/**
 * Mutation hook for updating a scheduled post
 */
export const useUpdateScheduledPost = () => {
  return useMutationData(
    ["update-scheduled-post"],
    (data: {
      id: string;
      caption?: string;
      mediaUrl?: string;
      mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL";
      postType?: "POST" | "REEL" | "STORY";
      scheduledFor?: Date;
      hashtags?: string[];
      automationId?: string | null;
      status?: "SCHEDULED" | "POSTED" | "FAILED" | "CANCELLED";
      carouselItems?: { imageUrl?: string; videoUrl?: string }[];
      altText?: string;
    }) => updateScheduledPost(data.id, data),
    "scheduled-posts"
  );
};

/**
 * Mutation hook for deleting a scheduled post
 */
export const useDeleteScheduledPost = () => {
  return useMutationData(
    ["delete-scheduled-post"],
    (data: { id: string }) => deleteScheduledPost(data.id),
    "scheduled-posts"
  );
};

/**
 * Mutation hook for publishing a scheduled post immediately
 */
export const usePublishScheduledPost = () => {
  return useMutationData(
    ["publish-scheduled-post"],
    (data: { id: string }) => publishScheduledPost(data.id),
    "scheduled-posts"
  );
};

/**
 * Query hook for checking publishing rate limit
 */
export const useQueryPublishingLimit = () => {
  return useQuery({
    queryKey: ["publishing-limit"],
    queryFn: checkPublishingLimit,
    staleTime: 60000, // Consider data fresh for 1 minute
  });
};

/**
 * Query hook for fetching content drafts
 */
export const useQueryContentDrafts = () => {
  return useQuery({
    queryKey: ["content-drafts"],
    queryFn: getContentDrafts,
  });
};

/**
 * Mutation hook for creating a draft
 */
export const useCreateDraft = () => {
  return useMutationData(
    ["create-draft"],
    (data: {
      title?: string;
      caption?: string;
      mediaUrl?: string;
      mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL";
    }) => createDraft(data),
    "content-drafts"
  );
};

/**
 * Mutation hook for updating a draft
 */
export const useUpdateDraft = () => {
  return useMutationData(
    ["update-draft"],
    (data: {
      id: string;
      title?: string;
      caption?: string;
      mediaUrl?: string;
      mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL";
    }) => updateDraft(data.id, data),
    "content-drafts"
  );
};

/**
 * Mutation hook for deleting a draft
 */
export const useDeleteDraft = () => {
  return useMutationData(
    ["delete-draft"],
    (data: { id: string }) => deleteDraft(data.id),
    "content-drafts"
  );
};
