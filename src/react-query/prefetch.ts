import { QueryClient, QueryFunction } from "@tanstack/react-query";

// REST API fetchers
async function fetchUserProfile() {
  const res = await fetch("/api/v1/user/profile");
  return res.json();
}

async function fetchAllAutomations() {
  const res = await fetch("/api/v1/automations");
  return res.json();
}

async function fetchNotifications(cursor?: string) {
  const url = cursor
    ? `/api/v1/notifications?cursor=${encodeURIComponent(cursor)}`
    : "/api/v1/notifications";
  const res = await fetch(url);
  return res.json();
}

async function fetchAutomationInfo(automationId: string) {
  const res = await fetch(`/api/v1/automations/${automationId}`);
  return res.json();
}

async function fetchUserAnalytics(slug: string) {
  const res = await fetch(`/api/v1/analytics?slug=${encodeURIComponent(slug)}`);
  return res.json();
}

// Prefetch helpers
const prefetch = async (
  client: QueryClient,
  action: QueryFunction,
  key: string
) => {
  return await client.prefetchQuery({
    queryKey: [key],
    queryFn: action,
    staleTime: 60000,
  });
};

const prefetchInfinite = async (
  client: QueryClient,
  action: QueryFunction<any, [string], string | null>,
  key: string
) => {
  return await client.prefetchInfiniteQuery({
    queryKey: [key],
    queryFn: action,
    initialPageParam: null,
    getNextPageParam: (lastPage: any) => lastPage.nextCursor,
    staleTime: 60000,
  });
};

export const PrefetchUserProfile = async (client: QueryClient) => {
  return await prefetch(client, fetchUserProfile, "user-profile");
};

export const PrefetchUserAutomations = async (client: QueryClient) => {
  return await prefetch(client, fetchAllAutomations, "user-automations");
};

export const PrefetchUserNotifications = async (client: QueryClient) => {
  return await prefetchInfinite(
    client,
    () => fetchNotifications(undefined),
    "user-notifications"
  );
};

export const PrefetchUserAutomation = async (
  client: QueryClient,
  automationId: string
) => {
  return await prefetch(
    client,
    () => fetchAutomationInfo(automationId),
    "automation-info"
  );
};

export const PrefetchUserAnalytics = async (
  client: QueryClient,
  slug: string
) => {
  return await prefetch(
    client,
    () => fetchUserAnalytics(slug),
    "user-analytics"
  );
};
