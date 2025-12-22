"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache data for 24 hours
            gcTime: 1000 * 60 * 60 * 24,
            // Consider data fresh for 5 minutes (then show stale while refetching)
            staleTime: 1000 * 60 * 5,
            // Don't refetch on window focus (reduces API calls)
            refetchOnWindowFocus: false,
            // Don't refetch automatically on mount if data exists
            refetchOnMount: false,
            // Retry failed requests twice
            retry: 2,
            // Don't refetch on reconnect
            refetchOnReconnect: false,
          },
          mutations: {
            // Retry mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
