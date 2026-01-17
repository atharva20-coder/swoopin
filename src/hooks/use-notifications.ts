import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

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

// === API Functions ===

async function fetchUserProfile() {
  const res = await fetch("/api/v1/users/me");
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message ?? "Failed to fetch user profile");
  }
  return res.json();
}

async function fetchNotifications(cursor?: string) {
  const url = cursor
    ? `/api/v1/notifications?cursor=${encodeURIComponent(cursor)}`
    : "/api/v1/notifications";
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message ?? "Failed to fetch notifications");
  }
  return res.json();
}

async function apiDeleteNotification(notificationId: string) {
  const res = await fetch(`/api/v1/notifications/${notificationId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message ?? "Failed to delete notification");
  }
  return res.json();
}

async function apiMarkNotificationAsRead(notificationId: string) {
  const res = await fetch(`/api/v1/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(
      error.error?.message ?? "Failed to mark notification as read",
    );
  }
  return res.json();
}

// === Hooks ===

export const useUserUnseenNotifications = () => {
  const { data } = useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
  });
  return {
    notifications: (data?.data?.notification ?? []) as Notification[],
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
  } = useInfiniteQuery<
    NotificationResponse,
    Error,
    PaginatedNotificationResponse
  >({
    queryKey: ["user-notifications"],
    queryFn: async ({ pageParam }) => {
      const response = await fetchNotifications(
        pageParam as string | undefined,
      );
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
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutate: deleteMutation } = useMutation({
    mutationKey: ["delete-notification"],
    mutationFn: () => apiDeleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
    },
  });

  const { isPending: isMarking, mutate: markAsSeen } = useMutation({
    mutationKey: ["read-notification"],
    mutationFn: () => apiMarkNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
    },
  });

  return {
    markAsSeen,
    isDeleting,
    deleteMutation,
    isMarking,
  };
};
