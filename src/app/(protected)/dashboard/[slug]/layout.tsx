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
  params: { slug: string };
};

const Layout = async ({ children, params }: Props) => {
  const query = new QueryClient();

  // Run all prefetch queries in parallel for faster page load
  await Promise.all([
    PrefetchUserProfile(query),
    PrefetchUserAutomations(query),
    PrefetchUserNotifications(query),
    PrefetchUserAnalytics(query, params.slug),
  ]);

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <LayoutClient params={params}>
        {children}
      </LayoutClient>
    </HydrationBoundary>
  );
};

export default Layout;