import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Fetch comments from REST API
 */
async function fetchComments() {
  const res = await fetch("/api/v1/comments");
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message ?? "Failed to fetch comments");
  }
  return res.json();
}

/**
 * Reply to a comment via REST API
 */
async function apiReplyToComment(commentId: string, message: string) {
  const res = await fetch(`/api/v1/comments/${commentId}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message ?? "Failed to reply to comment");
  }
  return res.json();
}

/**
 * Hide/unhide a comment via REST API
 */
async function apiHideComment(commentId: string, hide: boolean) {
  const res = await fetch(`/api/v1/comments/${commentId}/hide`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hide }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message ?? "Failed to hide comment");
  }
  return res.json();
}

/**
 * Delete a comment via REST API
 */
async function apiDeleteComment(commentId: string) {
  const res = await fetch(`/api/v1/comments/${commentId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message ?? "Failed to delete comment");
  }
  return res.json();
}

/**
 * React Query hook for fetching comments
 */
export function useComments() {
  return useQuery({
    queryKey: ["instagram-comments"],
    queryFn: fetchComments,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Mutation hook for replying to a comment
 */
export function useReplyToComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      message,
    }: {
      commentId: string;
      message: string;
    }) => apiReplyToComment(commentId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instagram-comments"] });
    },
  });
}

/**
 * Mutation hook for hiding/unhiding a comment
 */
export function useHideComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, hide }: { commentId: string; hide: boolean }) =>
      apiHideComment(commentId, hide),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instagram-comments"] });
    },
  });
}

/**
 * Mutation hook for deleting a comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => apiDeleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instagram-comments"] });
    },
  });
}
