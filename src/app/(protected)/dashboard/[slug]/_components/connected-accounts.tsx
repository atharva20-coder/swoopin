"use client";
import React from "react";
import { useQueryInstagramProfile } from "@/hooks/user-queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  MessageCircle,
  Users,
  Plus,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "#E1306C",
    gradient: "from-[#833AB4] via-[#E1306C] to-[#F77737]",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "#1877F2",
    gradient: "from-[#1877F2] to-[#42A5F5]",
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: Twitter,
    color: "#1DA1F2",
    gradient: "from-gray-900 to-gray-700",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "#0A66C2",
    gradient: "from-[#0A66C2] to-[#0077B5]",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "#FF0000",
    gradient: "from-[#FF0000] to-[#CC0000]",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: MessageCircle,
    color: "#25D366",
    gradient: "from-[#25D366] to-[#128C7E]",
  },
  {
    id: "gmail",
    name: "Gmail",
    icon: Mail,
    color: "#EA4335",
    gradient: "from-[#EA4335] to-[#FBBC05]",
  },
];

const ConnectedAccounts = () => {
  const params = useParams();
  const { data: instagramProfile, isLoading } = useQueryInstagramProfile();

  const isInstagramConnected =
    instagramProfile?.status === 200 && instagramProfile.data;
  const profile = isInstagramConnected ? instagramProfile.data : null;

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Build connected platforms array
  const connectedPlatforms = [
    ...(isInstagramConnected
      ? [
          {
            ...PLATFORMS[0],
            connected: true,
            profile: {
              username: profile?.username,
              name: profile?.name,
              avatar: profile?.profile_pic,
              followers: profile?.follower_count,
            },
          },
        ]
      : []),
  ];

  const availablePlatforms = PLATFORMS.filter(
    (p) => !connectedPlatforms.find((c) => c.id === p.id)
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-gray-100 dark:bg-neutral-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Connected Accounts
        </h2>
        <Link
          href={`/dashboard/${params.slug}/integrations`}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Platform
        </Link>
      </div>

      {/* Connected Platforms */}
      {connectedPlatforms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectedPlatforms.map((platform) => (
            <div
              key={platform.id}
              className="relative p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center`}
                >
                  <platform.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      @{platform.profile?.username}
                    </span>
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {platform.profile?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {platform.profile?.followers
                      ? formatFollowers(platform.profile.followers)
                      : "-"}
                  </p>
                  <p className="text-xs text-gray-500">followers</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available Platforms (Coming Soon) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {availablePlatforms.map((platform) => (
          <Link
            key={platform.id}
            href={`/dashboard/${params.slug}/integrations`}
            className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: `${platform.color}20` }}
            >
              <platform.icon
                className="w-5 h-5"
                style={{ color: platform.color }}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {platform.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ConnectedAccounts;
