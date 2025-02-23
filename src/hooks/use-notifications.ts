import { onUserInfo } from "@/actions/user";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useMutationData } from "./use-mutation-data";
import {
  deleteNotification,
  markNotificationAsRead,
  getNotification,
} from "@/actions/notifications";

type Notification = {
  id: string;
  createdAt: Date;
  userId: string | null;
  isSeen: boolean;
  content: string;
};

type NotificationResponse = {
  status: number;
  data: Notification[];
  nextCursor: string | null;
  error?: string;
};

type PaginatedNotificationResponse = {
  pages: NotificationResponse[];
  pageParams: (string | null)[];
};

export const useUserUnseenNotifications = () => {
  const { data } = useQuery({
    queryKey: ["user-profile"],
    queryFn: onUserInfo,
  });
  return {
    notifications: data?.data?.notification ?? [], // Return an empty array if undefined
    status: data?.status,
  };
};

export const useNotifications = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery<NotificationResponse, Error, PaginatedNotificationResponse>({
    queryKey: ["user-notifications"],
    queryFn: async ({ pageParam }) => {
      const response = await getNotification(pageParam as string | undefined);

      // Ensure `data` is always an array, even if the API returns undefined
      const notifications = response.data ?? [];
      const nextCursor = response.nextCursor ?? null;

      return {
        status: response.status,
        data: notifications,
        nextCursor,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
  });

  // Flatten the pages into a single array of notifications
  const notifications = data?.pages.flatMap((page) => page.data) ?? [];

  return {
    notifications,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  };
};

export const useNotificationsMutation = (notificationId: string) => {
  const { isPending: isDeleting, mutate: deleteMutation } = useMutationData(
    ["delete-notification"],
    () => deleteNotification(notificationId),
    "user-notifications",
    () => {},
    false
  );

  const { isPending: isMarking, mutate: markAsSeen } = useMutationData(
    ["read-notification"],
    () => markNotificationAsRead(notificationId),
    "user-notifications",
    () => {},
    false
  );

  return {
    markAsSeen,
    isDeleting,
    deleteMutation,
    isMarking,
  };
};