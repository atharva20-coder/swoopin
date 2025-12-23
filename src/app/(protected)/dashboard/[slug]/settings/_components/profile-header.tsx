"use client";
import React from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { BadgeCheck, LogOut, Link as LinkIcon, Phone, Mail, FileText, Globe, Instagram, Palette, Star, Building2, Briefcase, Target, GraduationCap, ShoppingBag, Compass } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { useQueryInstagramProfile, useQueryOnboardingProfile } from "@/hooks/user-queries";
import Link from "next/link";

// Profile type labels
const PROFILE_TYPE_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  CREATOR: { label: "Creator", icon: Palette, color: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
  INFLUENCER: { label: "Influencer", icon: Star, color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  AGENCY: { label: "Agency", icon: Building2, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  BRAND: { label: "Brand", icon: Briefcase, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  COACH: { label: "Coach", icon: Target, color: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
  EDUCATOR: { label: "Educator", icon: GraduationCap, color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  ECOMMERCE: { label: "E-commerce", icon: ShoppingBag, color: "bg-green-500/10 text-green-500 border-green-500/20" },
  EXPLORING: { label: "Explorer", icon: Compass, color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
};

// Pronouns display labels
const PRONOUNS_LABELS: Record<string, string> = {
  "he/him": "he/him",
  "she/her": "she/her",
  "they/them": "they/them",
  "other": "other",
  "prefer_not": "—",
};

// No props needed anymore

// Format follower count
const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return count.toString();
};

export default function ProfileHeader() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const user = session?.user;
  const { data: instagramProfile } = useQueryInstagramProfile();
  const { data: onboardingData } = useQueryOnboardingProfile();
  
  const profile = instagramProfile?.status === 200 ? instagramProfile.data : null;
  const onboardingProfile = onboardingData?.profile || null;
  const organization = onboardingData?.organization || null;

  const handleSignOut = async () => {
    const { signOut } = await import("@/lib/auth-client");
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/sign-in");
        },
      },
    });
  };


  const displayName = onboardingProfile?.displayName || profile?.name || user?.name || "User";
  const username = profile?.username || user?.email?.split("@")[0] || "user";
  const pronouns = onboardingProfile?.pronouns 
    ? (PRONOUNS_LABELS[onboardingProfile.pronouns] || onboardingProfile.pronouns) 
    : null;
  const profileType = onboardingProfile?.profileType ? PROFILE_TYPE_LABELS[onboardingProfile.profileType] : null;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden">
      <div className="p-4">
        {/* Connected Social Icons - Top Right */}
        <div className="flex justify-end mb-2">
          {profile?.username && (
            <div className="flex items-center gap-2">
              <a 
                href={`https://instagram.com/${profile.username}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white hover:scale-110 transition-transform"
                title={`@${profile.username}`}
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="flex gap-6 mb-4">
          {/* Left Column - Centered Avatar */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <div className="w-32 h-32 rounded-full border-2 border-gray-200 dark:border-neutral-700 overflow-hidden bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : profile?.profile_pic ? (
                <Image
                  src={profile.profile_pic}
                  alt={profile.name || "User"}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-gray-400">
                  {displayName[0] || "U"}
                </span>
              )}
            </div>
          </div>

          {/* Right Column - Profile Info */}
          <div className="flex-1 min-w-0">
            {/* Username Row */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {username}
              </h1>
              {profile?.is_verified_user && (
                <BadgeCheck className="w-5 h-5 text-blue-500" />
              )}
              {profileType && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1",
                  profileType.color
                )}>
                  <profileType.icon className="w-3 h-3" />
                  {profileType.label}
                </span>
              )}
            </div>

            {/* Display Name + Pronouns + Age */}
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              {displayName}
              {pronouns && <span className="text-gray-400 dark:text-gray-500 ml-1">{pronouns}</span>}
              {onboardingProfile?.age && <span className="text-gray-400 dark:text-gray-500 ml-1">• {onboardingProfile.age} yrs</span>}
            </p>

            {/* Stats Tiles */}
            <div className="flex gap-2 mb-2">
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg px-3 py-1.5 text-center border border-gray-100 dark:border-neutral-800">
                <span className="font-semibold text-gray-900 dark:text-white text-sm">{profile?.follower_count ? formatCount(profile.follower_count) : "-"}</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">followers</span>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg px-3 py-1.5 text-center border border-gray-100 dark:border-neutral-800">
                <span className="font-semibold text-gray-900 dark:text-white text-sm">{onboardingProfile?.platforms?.length || 0}</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">platforms</span>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg px-3 py-1.5 text-center border border-gray-100 dark:border-neutral-800">
                <span className="font-semibold text-gray-900 dark:text-white text-sm">{onboardingProfile?.automationGoals?.length || 0}</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">goals</span>
              </div>
            </div>

            {/* Bio */}
            {onboardingProfile?.bio && (
              <div className="mb-2">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                  <FileText className="w-3 h-3" />
                  <span>Bio</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-line">
                  {onboardingProfile.bio}
                </p>
              </div>
            )}

            {/* Links */}
            {organization?.website && (
              <div className="mb-2">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                  <Globe className="w-3 h-3" />
                  <span>Links</span>
                </div>
                <a 
                  href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-500 hover:underline inline-flex items-center gap-1 text-sm"
                >
                  <LinkIcon className="w-3 h-3" />
                  {organization.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              </div>
            )}

            {/* Contact Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              {onboardingProfile?.phoneNumber && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {onboardingProfile.phoneNumber}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-3">
          <Link href={`/dashboard/${slug}/settings/profile`} className="flex-1">
            <Button 
              variant="outline" 
              className="w-full bg-gray-100 dark:bg-neutral-800 border-0 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-white font-medium h-8 text-xs"
            >
              Edit Profile
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="flex-1 bg-gray-100 dark:bg-neutral-800 border-0 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-white font-medium h-8 text-xs"
            onClick={() => router.push(`/dashboard/${slug}/integrations`)}
          >
            Manage Integrations
          </Button>
          <Button 
            variant="destructive" 
            className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-0 h-8 px-2"
            onClick={handleSignOut}
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
