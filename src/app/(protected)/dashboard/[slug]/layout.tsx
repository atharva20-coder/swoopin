import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import React, { ReactNode } from "react";
import {
  PrefetchUserAutomations,
  PrefetchUserNotifications,
  PrefetchUserProfile,
  PrefetchUserAnalytics,
} from "@/react-query/prefetch";
import LayoutClient from "./layout-client";

type Props = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

const Layout = async ({ children, params }: Props) => {
  const { slug } = await params;
  const query = new QueryClient();

  // Run all prefetch queries in parallel for faster page load
  await Promise.all([
    PrefetchUserProfile(query),
    PrefetchUserAutomations(query),
    PrefetchUserNotifications(query),
    PrefetchUserAnalytics(query, slug),
  ]);

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <LayoutClient slug={slug}>{children}</LayoutClient>
    </HydrationBoundary>
  );
};

export default Layout;
