import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// === Types ===

type ScheduledPostStatus = "SCHEDULED" | "POSTED" | "FAILED" | "CANCELLED";
type MediaType = "IMAGE" | "VIDEO" | "CAROUSEL";
type PostType = "POST" | "REEL" | "STORY";

interface ScheduledPostOptions {
  status?: ScheduledPostStatus;
  fromDate?: Date;
  toDate?: Date;
  refetchInterval?: number;
}

interface CreateScheduledPostData {
  caption?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  postType?: PostType;
  scheduledFor: Date;
  hashtags?: string[];
  automationId?: string;
  carouselItems?: { imageUrl?: string; videoUrl?: string }[];
  altText?: string;
}

interface UpdateScheduledPostData extends Partial<CreateScheduledPostData> {
  id: string;
  status?: ScheduledPostStatus;
}

interface DraftData {
  title?: string;
  caption?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
}

// === API Functions ===

async function fetchScheduledPosts(
  options?: Omit<ScheduledPostOptions, "refetchInterval">,
) {
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.fromDate) params.set("fromDate", options.fromDate.toISOString());
  if (options?.toDate) params.set("toDate", options.toDate.toISOString());

  const url = `/api/v1/posts${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message ?? "Failed to fetch scheduled posts");
  }
  return res.json();
}

async function apiCreateScheduledPost(data: CreateScheduledPostData) {
  const res = await fetch("/api/v1/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message ?? "Failed to create scheduled post");
  }
  return res.json();
}

async function apiUpdateScheduledPost(
  id: string,
  data: Omit<UpdateScheduledPostData, "id">,
) {
  const res = await fetch(`/api/v1/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message ?? "Failed to update scheduled post");
  }
  return res.json();
}

async function apiDeleteScheduledPost(id: string) {
  const res = await fetch(`/api/v1/posts/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message ?? "Failed to delete scheduled post");
  }
  return res.json();
}

async function apiPublishScheduledPost(id: string) {
  const res = await fetch(`/api/v1/posts/${id}/publish`, {
    method: "POST",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message ?? "Failed to publish scheduled post");
  }
  return res.json();
}

async function fetchPublishingLimit() {
  const res = await fetch("/api/v1/posts/publishing-limit");
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message ?? "Failed to check publishing limit");
  }
  return res.json();
}

async function fetchContentDrafts() {
  const res = await fetch("/api/v1/drafts");
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message ?? "Failed to fetch drafts");
  }
  return res.json();
}

async function apiCreateDraft(data: DraftData) {
  const res = await fetch("/api/v1/drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message ?? "Failed to create draft");
  }
  return res.json();
}

async function apiUpdateDraft(id: string, data: DraftData) {
  const res = await fetch(`/api/v1/drafts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message ?? "Failed to update draft");
  }
  return res.json();
}

async function apiDeleteDraft(id: string) {
  const res = await fetch(`/api/v1/drafts/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message ?? "Failed to delete draft");
  }
  return res.json();
}

// === Query Hooks ===

/**
 * Query hook for fetching scheduled posts
 */
export const useQueryScheduledPosts = (options?: ScheduledPostOptions) => {
  return useQuery({
    queryKey: [
      "scheduled-posts",
      options?.status,
      options?.fromDate,
      options?.toDate,
    ],
    queryFn: () =>
      fetchScheduledPosts({
        status: options?.status,
        fromDate: options?.fromDate,
        toDate: options?.toDate,
      }),
    refetchInterval: options?.refetchInterval,
  });
};

/**
 * Query hook for checking publishing rate limit
 */
export const useQueryPublishingLimit = () => {
  return useQuery({
    queryKey: ["publishing-limit"],
    queryFn: fetchPublishingLimit,
    staleTime: 60000,
  });
};

/**
 * Query hook for fetching content drafts
 */
export const useQueryContentDrafts = () => {
  return useQuery({
    queryKey: ["content-drafts"],
    queryFn: fetchContentDrafts,
  });
};

// === Mutation Hooks ===

/**
 * Mutation hook for creating a scheduled post
 */
export const useCreateScheduledPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-scheduled-post"],
    mutationFn: (data: CreateScheduledPostData) => apiCreateScheduledPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
    },
  });
};

/**
 * Mutation hook for updating a scheduled post
 */
export const useUpdateScheduledPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-scheduled-post"],
    mutationFn: (data: UpdateScheduledPostData) =>
      apiUpdateScheduledPost(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
    },
  });
};

/**
 * Mutation hook for deleting a scheduled post
 */
export const useDeleteScheduledPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-scheduled-post"],
    mutationFn: (data: { id: string }) => apiDeleteScheduledPost(data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
    },
  });
};

/**
 * Mutation hook for publishing a scheduled post immediately
 */
export const usePublishScheduledPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["publish-scheduled-post"],
    mutationFn: (data: { id: string }) => apiPublishScheduledPost(data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
    },
  });
};

/**
 * Mutation hook for creating a draft
 */
export const useCreateDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-draft"],
    mutationFn: (data: DraftData) => apiCreateDraft(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-drafts"] });
    },
  });
};

/**
 * Mutation hook for updating a draft
 */
export const useUpdateDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-draft"],
    mutationFn: (data: DraftData & { id: string }) =>
      apiUpdateDraft(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-drafts"] });
    },
  });
};

/**
 * Mutation hook for deleting a draft
 */
export const useDeleteDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-draft"],
    mutationFn: (data: { id: string }) => apiDeleteDraft(data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-drafts"] });
    },
  });
};
