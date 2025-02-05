import { onUserInfo } from "@/actions/user";
import { useQuery } from "@tanstack/react-query";
import { useMutationData } from "./use-mutation-data";
import {
  deleteNotification,
  markNotificationAsRead,
  getNotification,
} from "@/actions/notifications";

export const useUserUnseenNotifications = () => {
  const { data } = useQuery({
    queryKey: ["user-profile"],
    queryFn: onUserInfo,
  });
  return {
    notification: data?.data?.notification,
    status: data?.status,
  };
};
export const useNotifications = () => {
  const { data } = useQuery({
    queryKey: ["user-notifications"],
    queryFn: getNotification,
  });
  const { isPending: isDeleting, mutate: deleteMutation } = useMutationData(
    ["delete-notification"],
    (data: { id: string }) => deleteNotification(data.id),
    "user-notifications"
  );
  const { isPending: isMarking, mutate: markAsSeen } = useMutationData(
    ["read-notification"],
    (data: { id: string }) => markNotificationAsRead(data.id),
    "user-notifications"
  );

  return {
    notifications: data?.data?.notification,
    status: data?.status,
    markAsSeen,
    isDeleting,
    deleteMutation,
    isMarking,
  };
};