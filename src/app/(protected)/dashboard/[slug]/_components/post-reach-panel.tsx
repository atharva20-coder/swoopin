"use client";
import React from "react";
import { useTelemetry } from "@/hooks/use-telemetry";
import {
  Image as ImageIcon,
  Video,
  LayoutGrid,
  MessageCircle,
  Send,
  TrendingUp,
  Sparkles,
} from "lucide-react";

/**
 * ============================================
 * POST REACH PANEL
 * Grid comparing posts linked to automations,
 * ranked by automation hits (most reached first)
 * ============================================
 */

// ── Media type badge map ──
const MEDIA_ICONS: Record<string, React.ReactNode> = {
  IMAGE: <ImageIcon className="w-3 h-3" />,
  VIDEO: <Video className="w-3 h-3" />,
  CAROUSEL_ALBUM: <LayoutGrid className="w-3 h-3" />,
};

// ── Format numbers ──
const fmt = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

// ── Post Card ──
type PostCardProps = {
  media: string;
  mediaType: string;
  caption: string | null;
  automationName: string;
  automationActive: boolean;
  dmHits: number;
  commentHits: number;
  totalHits: number;
  rank: number;
};

const PostCard = ({
  media,
  mediaType,
  caption,
  automationName,
  automationActive,
  dmHits,
  commentHits,
  totalHits,
  rank,
}: PostCardProps) => {
  return (
    <div className="group rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 overflow-hidden hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media}
          alt={caption ?? "Post"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Rank badge */}
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">#{rank}</span>
        </div>

        {/* Media type badge */}
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm flex items-center gap-1">
          <span className="text-white">
            {MEDIA_ICONS[mediaType] ?? MEDIA_ICONS.IMAGE}
          </span>
          <span className="text-[10px] font-medium text-white/80">
            {mediaType === "CAROUSEL_ALBUM"
              ? "Carousel"
              : mediaType.charAt(0) + mediaType.slice(1).toLowerCase()}
          </span>
        </div>

        {/* Total hits overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 pt-8">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-base font-bold text-white">
              {fmt(totalHits)}
            </span>
            <span className="text-xs text-white/70">hits</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Caption */}
        {caption && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {caption}
          </p>
        )}

        {/* Automation name + status */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
            {automationName}
          </span>
          <span
            className={`ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
              automationActive
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-500"
            }`}
          >
            {automationActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Hit breakdown */}
        <div className="flex items-center gap-4 pt-1 border-t border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {fmt(dmHits)} DMs
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-pink-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {fmt(commentHits)} Comments
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Loading skeleton ──
const SkeletonPostCard = () => (
  <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 animate-pulse overflow-hidden">
    <div className="aspect-square bg-neutral-200 dark:bg-neutral-700" />
    <div className="p-4 space-y-3">
      <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded" />
      <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded" />
      <div className="h-3 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded" />
    </div>
  </div>
);

/**
 * ============================================
 * MAIN COMPONENT
 * ============================================
 */
const PostReachPanel = () => {
  const { data: telemetry, isLoading } = useTelemetry();
  const posts = telemetry?.data?.topPosts ?? [];

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          <div className="h-5 w-36 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonPostCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-12 text-center">
        <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          No Post Data Yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
          Link posts to your automations to see which content drives the most
          engagement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Top Posts by Reach
        </h2>
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
          Ranked by automation hits
        </span>
      </div>

      {/* Post Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.slice(0, 6).map((post, index) => (
          <PostCard
            key={post.id}
            media={post.media}
            mediaType={post.mediaType}
            caption={post.caption}
            automationName={post.automationName}
            automationActive={post.automationActive}
            dmHits={post.dmHits}
            commentHits={post.commentHits}
            totalHits={post.totalHits}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
};

export default PostReachPanel;
