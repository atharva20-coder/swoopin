import {
  getAllAutomations,
  getAutomationInfo,
  getProfilePosts,
} from "@/actions/automations";
import { onUserInfo } from "@/actions/user";
import { useQuery } from "@tanstack/react-query";

export const useQueryAutomations = (config?: { refetchInterval?: number }) => {
  return useQuery({
    queryKey: ["user-automations"],
    queryFn: getAllAutomations,
    ...config
  });
};

export const useQueryAutomation = (id: string) => {
  return useQuery({
    queryKey: ["automation-info", id],
    queryFn: () => getAutomationInfo(id),
  });
};

export const useQueryUser = () => {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: onUserInfo,
  });
};

export const useQueryAutomationPosts = () => {
  const fetchPosts = async () => await getProfilePosts();
  return useQuery({
    queryKey: ["instagram-media"],
    queryFn: fetchPosts,
  });
};

export const useQueryInstagramProfile = () => {
  return useQuery({
    queryKey: ["instagram-profile"],
    queryFn: async () => {
      const { getInstagramProfile } = await import("@/actions/user");
      return getInstagramProfile();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useQueryOnboardingProfile = () => {
  return useQuery({
    queryKey: ["onboarding-profile"],
    queryFn: async () => {
      const res = await fetch("/api/onboarding");
      const data = await res.json();
      if (data.status === 200 && data.data) {
        return data.data;
      }
      return null;
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
};