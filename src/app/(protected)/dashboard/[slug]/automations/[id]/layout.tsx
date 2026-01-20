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

type Props = {
  children: ReactNode;
  params: Promise<{ slug: string; id: string }>;
};

const Layout = async ({ children, params }: Props) => {
  const { slug } = await params;
  const query = new QueryClient();

  await PrefetchUserProfile(query);

  await PrefetchUserAutomations(query);

  await PrefetchUserNotifications(query);

  await PrefetchUserAnalytics(query, slug);

  return (
    <HydrationBoundary state={dehydrate(query)}>
      {/* No sidebar wrapper - full width for automations page */}
      {children}
    </HydrationBoundary>
  );
};

export default Layout;
