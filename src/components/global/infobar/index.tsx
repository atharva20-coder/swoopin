"use client";

import { PAGE_BREAD_CRUMBS } from "@/constants/pages";
import React, { useState } from "react";
import { Notifications } from "./notifications";
import { usePaths } from "@/hooks/use-nav";
import Link from "next/link";
import { useQueryInstagramProfile } from "@/hooks/user-queries";
import { usePlatform, Platform } from "@/context/platform-context";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
  Mail,
  LayoutGrid,
} from "lucide-react";

type Props = {
  slug: string;
  isAdmin?: boolean;
};

const PLATFORM_CONFIG: Record<
  Platform,
  { name: string; color: string; bgGradient: string; icon: React.ElementType }
> = {
  all: {
    name: "All",
    color: "#6366F1",
    bgGradient: "from-indigo-500 to-purple-500",
    icon: LayoutGrid,
  },
  instagram: {
    name: "Instagram",
    color: "#E1306C",
    bgGradient: "from-[#833AB4] via-[#E1306C] to-[#F77737]",
    icon: Instagram,
  },
  facebook: {
    name: "Facebook",
    color: "#1877F2",
    bgGradient: "from-[#1877F2] to-[#4A90D9]",
    icon: Facebook,
  },
  twitter: {
    name: "Twitter",
    color: "#000000",
    bgGradient: "from-gray-800 to-gray-900",
    icon: Twitter,
  },
  linkedin: {
    name: "LinkedIn",
    color: "#0A66C2",
    bgGradient: "from-[#0A66C2] to-[#0077B5]",
    icon: Linkedin,
  },
  youtube: {
    name: "YouTube",
    color: "#FF0000",
    bgGradient: "from-[#FF0000] to-[#CC0000]",
    icon: Youtube,
  },
  whatsapp: {
    name: "WhatsApp",
    color: "#25D366",
    bgGradient: "from-[#25D366] to-[#128C7E]",
    icon: MessageCircle,
  },
  gmail: {
    name: "Gmail",
    color: "#EA4335",
    bgGradient: "from-[#EA4335] to-[#FBBC05]",
    icon: Mail,
  },
};

const InfoBar = ({ slug, isAdmin = false }: Props) => {
  const { page } = usePaths();
  const currentPage = PAGE_BREAD_CRUMBS.includes(page) || page == slug;

  const { data: instagramProfile } = useQueryInstagramProfile();
  const { activePlatform, setActivePlatform, connectedPlatforms } =
    usePlatform();
  const [isHovered, setIsHovered] = useState(false);

  const isInstagramConnected =
    instagramProfile?.status === 200 && instagramProfile.data;
  const instaProfile = isInstagramConnected ? instagramProfile.data : null;

  const allPlatforms: Platform[] = [
    "all",
    "instagram",
    "facebook",
    "twitter",
    "linkedin",
    "youtube",
    "whatsapp",
    "gmail",
  ];
  const otherConnected = connectedPlatforms.filter((p) => p !== activePlatform);

  const ActiveIcon = PLATFORM_CONFIG[activePlatform].icon;

  return (
    currentPage && (
      <div className="flex items-center justify-between w-full py-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/dashboard"
            className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            ninthnode
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 dark:text-white font-medium">
            {page === slug
              ? "Dashboard"
              : page.charAt(0).toUpperCase() + page.slice(1)}
          </span>
        </div>

        {/* Right Side - Platform Switcher & Notifications */}
        <div className="flex items-center gap-3">
          {/* Platform Switcher - Hidden for admin */}
          {!isAdmin && (
            <div
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Collapsed - Pill showing active platform */}
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer transition-all duration-300",
                  "bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700",
                  "hover:shadow-md",
                  isHovered && "opacity-0 pointer-events-none",
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center",
                    PLATFORM_CONFIG[activePlatform].bgGradient,
                  )}
                >
                  {activePlatform === "instagram" &&
                  instaProfile?.profile_pic ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={instaProfile.profile_pic}
                      alt=""
                      loading="lazy"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <ActiveIcon className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {PLATFORM_CONFIG[activePlatform].name}
                </span>
                <div className="flex -space-x-1 ml-1">
                  {otherConnected.slice(0, 2).map((p) => {
                    const Icon = PLATFORM_CONFIG[p].icon;
                    return (
                      <div
                        key={p}
                        className="w-4 h-4 rounded-full border border-white dark:border-neutral-800 flex items-center justify-center"
                        style={{ backgroundColor: PLATFORM_CONFIG[p].color }}
                      >
                        <Icon className="w-2.5 h-2.5 text-white" />
                      </div>
                    );
                  })}
                  <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 border border-white dark:border-neutral-800 flex items-center justify-center text-[8px] font-bold text-gray-600 dark:text-gray-300">
                    +{8 - connectedPlatforms.length}
                  </div>
                </div>
              </div>

              {/* Expanded - All platforms */}
              <div
                className={cn(
                  "absolute right-0 top-0 flex items-center gap-1.5 p-1.5 rounded-full transition-all duration-300",
                  "bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-lg",
                  isHovered
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none",
                )}
              >
                {allPlatforms.map((platform) => {
                  const config = PLATFORM_CONFIG[platform];
                  const Icon = config.icon;
                  const isActive = activePlatform === platform;
                  const isConnected =
                    connectedPlatforms.includes(platform) || platform === "all";

                  return (
                    <button
                      key={platform}
                      onClick={() => setActivePlatform(platform)}
                      disabled={!isConnected}
                      className={cn(
                        "relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                        "bg-gradient-to-br",
                        config.bgGradient,
                        isActive &&
                          "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-white",
                        !isConnected && "opacity-30 cursor-not-allowed",
                        isConnected && "hover:scale-110",
                      )}
                      title={
                        isConnected
                          ? config.name
                          : `${config.name} (Coming Soon)`
                      }
                    >
                      {platform === "instagram" && instaProfile?.profile_pic ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={instaProfile.profile_pic}
                          alt=""
                          loading="lazy"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Icon className="w-4 h-4 text-white" />
                      )}
                      {isActive && (
                        <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-green-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notifications */}
          <Notifications slug={slug} />
        </div>
      </div>
    )
  );
};

export default InfoBar;
