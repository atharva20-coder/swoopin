'use client'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import InfoBar from "@/components/global/infobar";
import Sidebar from "@/components/global/sidebar";
import MobileNav from "@/components/global/mobile-nav";
import React, { ReactNode } from "react";
import { PlatformProvider } from "@/context/platform-context";

type Props = {
  children: ReactNode;
  params: { slug: string };
};

const LayoutClient = ({ children, params }: Props) => {
  return (
    <PlatformProvider connectedPlatforms={['instagram']}>
      <div className="p-3">
        <Sidebar slug={params.slug} />
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
          <InfoBar slug={params.slug} />
          {children}
        </div>
      </div>
    </PlatformProvider>
  );
};

export default LayoutClient;
