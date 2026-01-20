"use client";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { useQueryUser } from "@/hooks/user-queries";
import InfoBar from "@/components/global/infobar";
import Sidebar from "@/components/global/sidebar";
import MobileNav from "@/components/global/mobile-nav";
import AdminNotificationBanner from "@/components/global/admin-notification-banner";
import React, { ReactNode, useEffect, useState } from "react";
import { PlatformProvider } from "@/context/platform-context";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type Props = {
  children: ReactNode;
  slug: string;
};

const LayoutClient = ({ children, slug }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useQueryUser();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  // Detect if current page is an admin page OR if user is an admin viewing settings/profile
  const isAdmin =
    pathname.includes("/admin") ||
    (!!(user?.data as any)?.isAdmin && pathname.includes("/settings"));

  // Check onboarding status for new users
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const res = await fetch("/api/onboarding");
        const data = await res.json();

        if (data.status === 200) {
          // Redirect if:
          // 1. No onboarding data exists (new user)
          // 2. Onboarding exists but not completed
          const isCompleted = data.data?.isCompleted === true;
          if (!isCompleted) {
            router.push("/onboarding");
            return;
          }
        }
      } catch (error) {
        console.error("Failed to check onboarding:", error);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [router]);

  // Show loading while checking onboarding
  if (isCheckingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <PlatformProvider connectedPlatforms={["instagram"]}>
      <div className="p-3">
        <Sidebar slug={slug} isAdmin={isAdmin} />
        <MobileNav slug={slug} />
        <div
          className="
            lg:ml-[var(--sidebar-width,250px)] 
            lg:pl-10 
            lg:pt-2
            flex 
            flex-col 
            overflow-auto
            pb-24
            transition-all
            duration-300
          "
        >
          <InfoBar slug={slug} isAdmin={isAdmin} />
          {/* Show admin notification banners for regular users only */}
          {!isAdmin && <AdminNotificationBanner />}
          {children}
        </div>
      </div>
    </PlatformProvider>
  );
};

export default LayoutClient;
