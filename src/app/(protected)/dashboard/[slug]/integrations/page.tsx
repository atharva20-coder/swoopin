"use client";

import React, { useState } from "react";
import GoogleIntegrationCard from "./_components/google-integration-card";
import InstagramIntegrationCard from "./_components/instagram-integration-card";
import YouTubeIntegrationCard from "./_components/youtube-integration-card";
import ComingSoonCard from "./_components/coming-soon-card";
import CanvaIntegrationCard from "@/components/global/canva-integration-card";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  SlidersHorizontal,
  Instagram,
  Mail,
  Facebook,
  Linkedin,
  Youtube,
  FileSpreadsheet,
  Palette,
  BookOpen,
  MessageCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type Category = "all" | "social" | "productivity" | "marketing" | "coming-soon";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "View all" },
  { value: "social", label: "Social Media" },
  { value: "productivity", label: "Productivity" },
  { value: "marketing", label: "Marketing" },
  { value: "coming-soon", label: "Coming Soon" },
];

const CELL_SIZE = 70;

// Grid icons using Lucide (updated without Twitter/Messenger/Threads)
const GRID_ICONS = [
  { Icon: Instagram, color: "#E1306C", row: 0, col: 0 },
  { Icon: FileSpreadsheet, color: "#34A853", row: 0, col: 3 },
  { Icon: Palette, color: "#8B5CF6", row: 1, col: 1 },
  { Icon: Facebook, color: "#1877F2", row: 2, col: 3 },
  { Icon: BookOpen, color: "#000", row: 3, col: 0 },
  { Icon: Mail, color: "#EA4335", row: 4, col: 2 },
  { Icon: Linkedin, color: "#0A66C2", row: 5, col: 0 },
  { Icon: Youtube, color: "#FF0000", row: 6, col: 3 },
];

// Coming soon integrations data
const COMING_SOON_INTEGRATIONS = [
  {
    id: "facebook",
    title: "Facebook",
    description: "Connect with Facebook to expand your reach",
    icon: <Facebook className="w-6 h-6 text-[#1877F2]" />,
    iconBgColor: "bg-blue-100 dark:bg-blue-900/30",
    category: "social" as const,
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    description: "Connect WhatsApp to engage with your customers",
    icon: <MessageCircle className="w-6 h-6 text-[#25D366]" />,
    iconBgColor: "bg-green-100 dark:bg-green-900/30",
    category: "social" as const,
  },
  {
    id: "linkedin",
    title: "LinkedIn",
    description: "Build professional connections on LinkedIn",
    icon: <Linkedin className="w-6 h-6 text-[#0A66C2]" />,
    iconBgColor: "bg-blue-100 dark:bg-blue-900/30",
    category: "social" as const,
  },
  {
    id: "newsletter",
    title: "Newsletter",
    description: "Engage your audience through email newsletters",
    icon: <Mail className="w-6 h-6 text-[#EA4335]" />,
    iconBgColor: "bg-red-100 dark:bg-red-900/30",
    category: "marketing" as const,
  },
  {
    id: "notion",
    title: "Notion CRM",
    description: "Sync leads and contacts with your Notion workspace",
    icon: <BookOpen className="w-6 h-6 text-gray-900 dark:text-white" />,
    iconBgColor: "bg-gray-200 dark:bg-neutral-700",
    category: "productivity" as const,
  },
];

export default function IntegrationsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  // Filter coming soon cards based on category
  const filteredComingSoon = COMING_SOON_INTEGRATIONS.filter((item) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "coming-soon") return true;
    return item.category === activeCategory;
  });

  // Check if we should show active integrations based on category
  const showActiveIntegrations =
    activeCategory === "all" ||
    activeCategory === "social" ||
    activeCategory === "productivity";

  return (
    <div className="flex h-[calc(100vh-4rem)] p-4 gap-4">
      {/* Left Card - Grid with Icons */}
      <div className="hidden lg:flex w-[320px] shrink-0 bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-neutral-700/50 overflow-hidden flex-col relative">
        {/* Grid Background Pattern */}
        <div
          className="absolute inset-0 grid-pattern"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)
            `,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
          }}
        />
        {/* Dark mode grid overlay */}
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
          }}
        />

        {/* Scattered Icons */}
        <div className="flex-1 relative p-2">
          {GRID_ICONS.map((item, i) => {
            const IconComponent = item.Icon;
            return (
              <div
                key={i}
                className="absolute w-[56px] h-[56px] rounded-xl bg-white dark:bg-[#2a2a2a] shadow-sm border border-gray-200 dark:border-gray-600/50 flex items-center justify-center transition-transform hover:scale-110 hover:shadow-md"
                style={{
                  top: item.row * CELL_SIZE + 7,
                  left: item.col * CELL_SIZE + 7,
                }}
              >
                <IconComponent
                  className="w-7 h-7"
                  style={{ color: item.color }}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="relative p-5 border-t border-gray-200 dark:border-neutral-700/50 bg-gray-100/95 dark:bg-[#1a1a1a]/95 backdrop-blur-sm">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Add integrations
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">
            Connect your favorite tools to supercharge your workflow.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-neutral-700"
            >
              I&apos;ll do this later
            </Button>
            <Button
              size="sm"
              className="gap-1 text-xs h-8 bg-blue-600 hover:bg-blue-700"
            >
              Continue <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Card - Integrations List */}
      <div className="flex-1 bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-neutral-700/50 flex flex-col overflow-hidden">
        {/* Breadcrumbs + Filter Tabs */}
        <div className="p-6 pb-4 shrink-0">
          {/* Simple Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm mb-4">
            <a
              href={`/dashboard/${slug}`}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Dashboard
            </a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white font-medium">
              Integrations
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-neutral-800">
            <div className="flex gap-1 overflow-x-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition",
                    activeCategory === cat.value
                      ? "bg-gray-900 dark:bg-neutral-700 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800",
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-sm ml-2 shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
              Recent
            </button>
          </div>
        </div>

        {/* Scrollable Integration List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-1">
            {/* Active Integrations Section */}
            {showActiveIntegrations && (
              <>
                {/* Instagram Integration - Social */}
                {(activeCategory === "all" || activeCategory === "social") && (
                  <InstagramIntegrationCard />
                )}

                {/* YouTube Integration - Social */}
                {(activeCategory === "all" || activeCategory === "social") && (
                  <YouTubeIntegrationCard />
                )}

                {/* Google Sheets Integration - Productivity */}
                {(activeCategory === "all" ||
                  activeCategory === "productivity") && (
                  <GoogleIntegrationCard />
                )}

                {/* Canva Integration - Productivity */}
                {(activeCategory === "all" ||
                  activeCategory === "productivity") && (
                  <CanvaIntegrationCard />
                )}

                {/* Divider before coming soon */}
                {filteredComingSoon.length > 0 && (
                  <div className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 border-t border-gray-100 dark:border-neutral-800" />
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                        COMING SOON
                      </span>
                      <div className="flex-1 border-t border-gray-100 dark:border-neutral-800" />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Coming Soon Integrations */}
            {filteredComingSoon.map((item) => (
              <ComingSoonCard
                key={item.id}
                title={item.title}
                description={item.description}
                icon={item.icon}
                iconBgColor={item.iconBgColor}
              />
            ))}

            {/* Empty state */}
            {!showActiveIntegrations && filteredComingSoon.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No integrations found in this category
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
