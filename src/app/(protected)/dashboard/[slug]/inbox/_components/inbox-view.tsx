"use client";

import React, { useState, useCallback, memo, useMemo } from "react";
import {
  useComments,
  useReplyToComment,
  useHideComment,
  useDeleteComment,
} from "@/hooks/use-comments";
import {
  MessageCircle,
  Send,
  EyeOff,
  Eye,
  Trash2,
  Heart,
  RefreshCw,
  Inbox as InboxIcon,
  ChevronDown,
  ChevronUp,
  X,
  CornerDownRight,
} from "lucide-react";
import type {
  MediaWithComments,
  InstagramComment,
} from "@/lib/instagram/comments";

// =============================================================================
// Comment Component (Recursive for nested replies)
// =============================================================================

interface CommentProps {
  comment: InstagramComment;
  onReply: (commentId: string, message: string) => void;
  onHide: (commentId: string, hide: boolean) => void;
  onDelete: (commentId: string) => void;
  activeCommentId: string | null;
  actionType: "reply" | "hide" | "delete" | null;
  depth?: number;
}

function Comment({
  comment,
  onReply,
  onHide,
  onDelete,
  activeCommentId,
  actionType,
  depth = 0,
}: CommentProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(true);

  const isReplying = activeCommentId === comment.id && actionType === "reply";
  const isHiding = activeCommentId === comment.id && actionType === "hide";
  const isDeleting = activeCommentId === comment.id && actionType === "delete";

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText("");
      setShowReplyInput(false);
    }
  };

  const hasReplies = comment.replies && comment.replies.length > 0;
  const isNested = depth > 0;

  return (
    <div className={`${isNested ? "mt-3" : ""}`}>
      <div className={`flex gap-3 ${comment.hidden ? "opacity-50" : ""}`}>
        {isNested && (
          <div className="flex items-start pt-2">
            <CornerDownRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
          </div>
        )}

        <div
          className={`${
            isNested ? "w-8 h-8" : "w-10 h-10"
          } rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[2px] flex-shrink-0`}
        >
          <div className="w-full h-full rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center">
            <span
              className={`font-semibold text-gray-700 dark:text-gray-300 ${
                isNested ? "text-xs" : "text-sm"
              }`}
            >
              {(comment.username || "U").charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl px-4 py-2.5">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {comment.username || "unknown"}
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5 whitespace-pre-wrap break-words">
              {comment.text}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1.5 ml-1 flex-wrap">
            <span className="text-xs text-gray-500">
              {comment.timestamp
                ? new Date(comment.timestamp).toLocaleDateString()
                : ""}
            </span>

            {comment.like_count > 0 && (
              <>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                  <Heart className="w-3 h-3" /> {comment.like_count}
                </span>
              </>
            )}

            <span className="text-gray-300 dark:text-gray-600">•</span>

            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-xs font-semibold text-gray-500 hover:text-blue-500 transition-colors"
            >
              Reply
            </button>

            <button
              onClick={() => onHide(comment.id, !comment.hidden)}
              disabled={isHiding}
              className="text-xs font-semibold text-gray-500 hover:text-orange-500 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {comment.hidden ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
              {comment.hidden ? "Unhide" : "Hide"}
            </button>

            <button
              onClick={() => onDelete(comment.id)}
              disabled={isDeleting}
              className="text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>

          {showReplyInput && (
            <div className="flex items-center gap-2 mt-3 ml-1">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to @${comment.username || "user"}...`}
                className="flex-1 px-4 py-2 text-sm rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                autoFocus
              />
              <button
                onClick={handleReply}
                disabled={!replyText.trim() || isReplying}
                className="px-4 py-2 rounded-full bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {hasReplies && (
            <div className="mt-2 ml-1">
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1 mb-2"
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="w-3 h-3" /> Hide{" "}
                    {comment.replies!.length} replies
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" /> View{" "}
                    {comment.replies!.length} replies
                  </>
                )}
              </button>

              {showReplies && (
                <div className="border-l-2 border-gray-200 dark:border-neutral-700 pl-3 space-y-3">
                  {comment.replies!.map((reply) => (
                    <Comment
                      key={reply.id}
                      comment={reply}
                      onReply={onReply}
                      onHide={onHide}
                      onDelete={onDelete}
                      activeCommentId={activeCommentId}
                      actionType={actionType}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Memoize Comment component to prevent re-renders
const MemoizedComment = memo(Comment);

// =============================================================================
// Comment Modal
// =============================================================================

interface CommentModalProps {
  media: MediaWithComments;
  onClose: () => void;
  onReply: (commentId: string, message: string) => void;
  onHide: (commentId: string, hide: boolean) => void;
  onDelete: (commentId: string) => void;
  activeCommentId: string | null;
  actionType: "reply" | "hide" | "delete" | null;
}

function CommentModal({
  media,
  onClose,
  onReply,
  onHide,
  onDelete,
  activeCommentId,
  actionType,
}: CommentModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-neutral-800 flex-shrink-0">
          {media.media_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.media_url}
              alt=""
              loading="lazy"
              className="w-14 h-14 rounded-xl object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 font-medium">
              {media.caption || "No caption"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {media.comments.length} comments •{" "}
              {new Date(media.timestamp).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Comments List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {media.comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
              <p>No comments on this post</p>
            </div>
          ) : (
            media.comments.map((comment) => (
              <MemoizedComment
                key={comment.id}
                comment={comment}
                onReply={onReply}
                onHide={onHide}
                onDelete={onDelete}
                activeCommentId={activeCommentId}
                actionType={actionType}
                depth={0}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Post Card (Compact)
// =============================================================================

interface PostCardProps {
  media: MediaWithComments;
  onClick: () => void;
}

function PostCard({ media, onClick }: PostCardProps) {
  const latestComment = media.comments[0];

  return (
    <button
      onClick={onClick}
      className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 text-left hover:shadow-lg hover:border-gray-300 dark:hover:border-neutral-700 transition-all group"
    >
      <div className="flex items-start gap-3">
        {/* Post Thumbnail */}
        {media.media_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.media_url}
            alt=""
            loading="lazy"
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Caption */}
          <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {media.caption || "No caption"}
          </p>

          {/* Meta */}
          <p className="text-xs text-gray-500 mt-1">
            {new Date(media.timestamp).toLocaleDateString()}
          </p>

          {/* Latest Comment Preview */}
          {latestComment && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-neutral-800/50 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                <span className="font-semibold">
                  @{latestComment.username || "user"}
                </span>{" "}
                {latestComment.text}
              </p>
            </div>
          )}
        </div>

        {/* Comment Count Badge */}
        <div className="flex-shrink-0 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
          {media.comments_count}
        </div>
      </div>
    </button>
  );
}

// Memoize components
const MemoizedPostCard = memo(PostCard);
const MemoizedCommentModal = memo(CommentModal);

// =============================================================================
// Main Inbox Component
// =============================================================================

export default function InboxView() {
  const {
    data: commentsData,
    isLoading,
    refetch,
    isRefetching,
  } = useComments();
  const replyMutation = useReplyToComment();
  const hideMutation = useHideComment();
  const deleteMutation = useDeleteComment();

  const [selectedMedia, setSelectedMedia] = useState<MediaWithComments | null>(
    null
  );
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<
    "reply" | "hide" | "delete" | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);

  const POSTS_PER_PAGE = 12;

  const totalComments = commentsData?.data?.totalComments || 0;

  // Memoize filtered and paginated posts - type assertion following Zero-Patchwork protocol
  const { postsWithComments, paginatedPosts, totalPages } = useMemo(() => {
    const media = (commentsData?.data?.media || []) as MediaWithComments[];
    const filtered = media.filter((m) => m.comments.length > 0);
    const pages = Math.ceil(filtered.length / POSTS_PER_PAGE);
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const paginated = filtered.slice(startIndex, startIndex + POSTS_PER_PAGE);
    return {
      postsWithComments: filtered,
      paginatedPosts: paginated,
      totalPages: pages,
    };
  }, [commentsData?.data?.media, currentPage]);

  const handleReply = useCallback(
    async (commentId: string, message: string) => {
      setActiveCommentId(commentId);
      setActionType("reply");
      try {
        await replyMutation.mutateAsync({ commentId, message });
      } finally {
        setActiveCommentId(null);
        setActionType(null);
      }
    },
    [replyMutation]
  );

  const handleHide = useCallback(
    async (commentId: string, hide: boolean) => {
      setActiveCommentId(commentId);
      setActionType("hide");
      try {
        await hideMutation.mutateAsync({ commentId, hide });
      } finally {
        setActiveCommentId(null);
        setActionType(null);
      }
    },
    [hideMutation]
  );

  const handleDelete = useCallback(
    async (commentId: string) => {
      if (!confirm("Delete this comment?")) return;
      setActiveCommentId(commentId);
      setActionType("delete");
      try {
        await deleteMutation.mutateAsync(commentId);
      } finally {
        setActiveCommentId(null);
        setActionType(null);
      }
    },
    [deleteMutation]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-4 animate-pulse border border-gray-200 dark:border-neutral-800"
          >
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-neutral-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-neutral-700 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-neutral-700 rounded" />
                <div className="h-8 w-full bg-gray-100 dark:bg-neutral-800 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (postsWithComments.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
          <InboxIcon className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No comments yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          When people comment on your posts, they will appear here for you to
          manage.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Comments
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalComments} comments across {postsWithComments.length} posts
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Posts Grid - Paginated for performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {paginatedPosts.map((m) => (
          <MemoizedPostCard
            key={m.id}
            media={m}
            onClick={() => setSelectedMedia(m)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages} ({postsWithComments.length}{" "}
            posts)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {selectedMedia && (
        <MemoizedCommentModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onReply={handleReply}
          onHide={handleHide}
          onDelete={handleDelete}
          activeCommentId={activeCommentId}
          actionType={actionType}
        />
      )}
    </div>
  );
}
