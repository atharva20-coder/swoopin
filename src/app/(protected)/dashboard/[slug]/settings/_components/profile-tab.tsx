"use client";
import React from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Instagram, Loader2, Play, Image as ImageIcon, Video, Zap, Handshake, TrendingUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useQueryInstagramProfile, useQueryOnboardingProfile } from "@/hooks/user-queries";

interface ProfileTabProps {
  slug: string;
}

// Format count for display
const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return count.toString();
};

export default function ProfileTab({ slug }: ProfileTabProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const { data: instagramProfile, isLoading: isLoadingInstagram } = useQueryInstagramProfile();
  const { data: onboardingData, isLoading } = useQueryOnboardingProfile();
  
  const igProfile = instagramProfile?.status === 200 ? instagramProfile.data : null;
  const onboardingProfile = onboardingData?.profile || null;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Performing Content */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Top Performing Content
          </h3>
          <Link href={`/dashboard/${slug}/analytics`} className="text-xs text-indigo-500 hover:underline">
            View All →
          </Link>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {/* Best Reel */}
          <div className="bg-gray-50 dark:bg-neutral-900 rounded-xl p-4 text-center border border-gray-100 dark:border-neutral-800">
            <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-2">
              <Play className="w-5 h-5 text-pink-500" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">-</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Best Reel</p>
            <p className="text-xs text-emerald-500 mt-1">- views</p>
          </div>

          {/* Best Post */}
          <div className="bg-gray-50 dark:bg-neutral-900 rounded-xl p-4 text-center border border-gray-100 dark:border-neutral-800">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">-</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Best Post</p>
            <p className="text-xs text-emerald-500 mt-1">- likes</p>
          </div>

          {/* Best Story */}
          <div className="bg-gray-50 dark:bg-neutral-900 rounded-xl p-4 text-center border border-gray-100 dark:border-neutral-800">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-2">
              <Video className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">-</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Best Story</p>
            <p className="text-xs text-emerald-500 mt-1">- views</p>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
          Connect Instagram to see your top content
        </p>
      </div>

      {/* Automation Stats */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Automation Performance
          </h3>
          <Link href={`/dashboard/${slug}/automations`} className="text-xs text-indigo-500 hover:underline">
            Manage →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Total Triggers */}
          <div className="bg-gray-50 dark:bg-neutral-900 rounded-xl p-4 border border-gray-100 dark:border-neutral-800">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Triggers (30d)</p>
          </div>

          {/* Active Automations */}
          <div className="bg-gray-50 dark:bg-neutral-900 rounded-xl p-4 border border-gray-100 dark:border-neutral-800">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {onboardingProfile?.automationGoals?.length || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active Automations</p>
          </div>
        </div>

        {/* Top Triggered Automation */}
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-800/30">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">🔥 Most Triggered</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">No automations triggered yet</p>
        </div>
      </div>

      {/* Brand Collaborations */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Handshake className="w-4 h-4 text-indigo-500" />
            Brand Collaborations
          </h3>
          <Link href={`/dashboard/${slug}/collabs`} className="text-xs text-indigo-500 hover:underline">
            View All →
          </Link>
        </div>

        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3">
            <Handshake className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">No collaborations yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Your brand partnerships will appear here
          </p>
        </div>
      </div>

      {/* Connected Account Summary */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Instagram className="w-4 h-4 text-pink-500" />
          Connected Account
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              {igProfile?.username ? (
                <>
                  <p className="font-medium text-gray-900 dark:text-white">@{igProfile.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {igProfile.follower_count ? formatCount(igProfile.follower_count) + " followers" : "Connected"}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-gray-900 dark:text-white">Instagram</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Not connected</p>
                </>
              )}
            </div>
          </div>
          <Link href={`/dashboard/${slug}/integrations`}>
            {igProfile?.username ? (
              <Button variant="outline" size="sm" className="h-8 text-xs dark:text-white dark:border-neutral-700">
                Manage
              </Button>
            ) : (
              <Button size="sm" className="h-8 text-xs bg-gradient-to-r from-purple-600 to-pink-600 border-0">
                Connect
              </Button>
            )}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-2">
        <Link href="/onboarding" className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
          ← Re-take Onboarding
        </Link>
        <Link 
          href={`/dashboard/${slug}/settings/profile`}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
        >
          Edit profile
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
