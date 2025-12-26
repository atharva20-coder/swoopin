import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComments,
  replyToComment,
  hideComment,
  deleteComment,
} from "@/actions/comments";

/**
 * React Query hook for fetching comments
 */
export function useComments() {
  return useQuery({
    queryKey: ["instagram-comments"],
    queryFn: () => getComments(),
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
    mutationFn: ({ commentId, message }: { commentId: string; message: string }) =>
      replyToComment(commentId, message),
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
      hideComment(commentId, hide),
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
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instagram-comments"] });
    },
  });
}
