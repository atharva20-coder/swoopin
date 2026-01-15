import { useNotificationsMutation } from "@/hooks/use-notifications";
import { Notification } from "@prisma/client";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
  notification: Notification;
};

/**
 * Notification item component
 * The hook already captures the notification ID, so mutate functions expect void
 * Following Zero-Patchwork Protocol
 */
const NotificationItem = ({ notification }: Props) => {
  const router = useRouter();
  const { deleteMutation, isDeleting, isMarking, markAsSeen } =
    useNotificationsMutation(notification.id);

  return (
    <div
      key={notification.id}
      className={`group relative flex flex-col gap-2 p-4 hover:bg-muted/50 dark:hover:bg-muted/20 transition-all duration-200 cursor-pointer ${
        !notification.isSeen
          ? "bg-muted dark:bg-muted/10 border-l-2 border-primary"
          : ""
      } ${isMarking || isDeleting ? "opacity-50" : ""}`}
      onClick={() => {
        if (!notification.isSeen) {
          // Hook already has the ID - pass undefined as the argument
          markAsSeen(undefined, {
            onSuccess: () => {
              router.refresh();
            },
          });
        }
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering the parent onClick
          // Hook already has the ID - pass undefined as the argument
          deleteMutation(undefined, {
            onSuccess: () => {
              router.refresh();
            },
          });
        }}
        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-destructive dark:hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <div className="flex items-start justify-between gap-4">
        <p
          className={`text-sm ${
            !notification.isSeen
              ? "text-foreground dark:text-gray-200 font-medium"
              : "text-muted-foreground dark:text-gray-400"
          }`}
        >
          {notification.content}
        </p>
        {!notification.isSeen && !isMarking && (
          <span className="h-2 w-2 rounded-full bg-primary dark:bg-blue-400 flex-shrink-0 mt-1 animate-pulse" />
        )}
      </div>
      <span className="text-xs text-muted-foreground dark:text-gray-500">
        {format(new Date(notification.createdAt), "PPp")}
      </span>
    </div>
  );
};

export default NotificationItem;
