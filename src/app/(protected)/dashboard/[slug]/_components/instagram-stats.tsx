"use client";
import React from "react";
import {
  useQueryInstagramProfile,
  useQueryAutomationPosts,
} from "@/hooks/user-queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Instagram,
  Users,
  Eye,
  Play,
  Heart,
  MessageCircle,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const InstagramStats = () => {
  const params = useParams();
  const { data: instagramProfile, isLoading } = useQueryInstagramProfile();
  const { data: postsData, isLoading: isLoadingPosts } =
    useQueryAutomationPosts();

  const isConnected = instagramProfile?.status === 200 && instagramProfile.data;
  const profile = isConnected ? instagramProfile.data : null;

  // Get top post from the fetched posts (first one as placeholder for "most viewed")
  // Data is properly typed from Zod parsing in hook
  const posts =
    postsData?.status === 200 && postsData.data ? postsData.data : [];
  const topContent = posts.length > 0 ? posts[0] : null;

  const formatNumber = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (isLoading) {
    return (
      <div className="h-24 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 animate-pulse" />
    );
  }

  if (!isConnected) {
    return (
      <Link
        href={`/dashboard/${params.slug}/integrations`}
        className="group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300"
      >
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-105 transition-transform">
          <Instagram className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-medium">Connect Instagram</p>
          <p className="text-white/70 text-sm">
            Link your account to unlock analytics
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </Link>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Profile Card */}
      <div className="flex-1 flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-100 dark:border-neutral-800">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-12 h-12 ring-2 ring-pink-500/30 ring-offset-2 ring-offset-white dark:ring-offset-gray-900">
              <AvatarImage src={profile?.profile_pic || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-[#833AB4] to-[#E1306C] text-white font-medium">
                {profile?.name?.[0] || "I"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                @{profile?.username}
              </span>
              <Instagram className="w-4 h-4 text-pink-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profile?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {profile?.follower_count
              ? formatNumber(profile.follower_count)
              : "0"}
          </span>
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            followers
          </span>
        </div>
      </div>

      {/* Top Content Card */}
      {topContent ? (
        <div className="sm:w-80 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Latest Post
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 capitalize">
              {topContent.media_type?.toLowerCase() || "post"}
            </span>
          </div>

          <div className="flex gap-3">
            {/* Thumbnail */}
            <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-neutral-700 shrink-0">
              {topContent.media_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/instagram-proxy?url=${encodeURIComponent(
                    topContent.media_url
                  )}`}
                  alt="Post thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
              {topContent.media_type === "VIDEO" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                    <Play
                      className="w-3 h-3 text-gray-800 ml-0.5"
                      fill="currentColor"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {topContent.caption || "No caption"}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {topContent.timestamp
                  ? new Date(topContent.timestamp).toLocaleDateString()
                  : ""}
              </p>
            </div>
          </div>
        </div>
      ) : isLoadingPosts ? (
        <div className="sm:w-80 p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800 animate-pulse">
          <div className="h-4 w-24 bg-gray-200 dark:bg-neutral-700 rounded mb-3" />
          <div className="flex gap-3">
            <div className="w-16 h-20 bg-gray-200 dark:bg-neutral-700 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded" />
              <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-3/4" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default InstagramStats;
