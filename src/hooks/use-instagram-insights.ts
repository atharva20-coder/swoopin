import { useQuery } from "@tanstack/react-query";
import { getInstagramInsights } from "@/actions/insights";

/**
 * React Query hook for Instagram Insights
 * Caches for 5 minutes to reduce API calls (important for 1000+ users)
 */
export function useInstagramInsights() {
  return useQuery({
    queryKey: ["instagram-insights"],
    queryFn: () => getInstagramInsights(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on focus to save API calls
    retry: 1, // Only retry once on failure
  });
}
