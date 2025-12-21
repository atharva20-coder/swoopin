'use client'
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
import React, { ReactNode } from "react";
import { PlatformProvider } from "@/context/platform-context";
import { usePathname } from "next/navigation";

type Props = {
  children: ReactNode;
  params: { slug: string };
};

const LayoutClient = ({ children, params }: Props) => {
  const pathname = usePathname();
  const { data: user } = useQueryUser();
  
  // Detect if current page is an admin page OR if user is an admin viewing settings/profile
  const isAdmin = pathname.includes('/admin') || (!!(user?.data as any)?.isAdmin && pathname.includes('/settings'));

  return (
    <PlatformProvider connectedPlatforms={['instagram']}>
      <div className="p-3">
        <Sidebar slug={params.slug} isAdmin={isAdmin} />
        <MobileNav slug={params.slug} />
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
          <InfoBar slug={params.slug} isAdmin={isAdmin} />
          {/* Show admin notification banners for regular users only */}
          {!isAdmin && <AdminNotificationBanner />}
          {children}
        </div>
      </div>
    </PlatformProvider>
  );
};

export default LayoutClient;
