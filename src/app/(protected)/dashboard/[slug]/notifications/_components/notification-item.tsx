import { Button } from "@/components/ui/button";
import { useNotificationsMutation } from "@/hooks/use-notifications";
import { Notification } from "@prisma/client";
import { Link2, Loader, Trash2, Check, Circle } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Props = {
  notification: Notification;
};

const NotificationItem = ({ notification }: Props) => {
  const router = useRouter();
  const { deleteMutation, isDeleting, isMarking, markAsSeen } =
    useNotificationsMutation(notification.id);

  const handleMarkAsRead = () => {
    // The hook already captures notificationId, no need to pass it
    markAsSeen(undefined, {
      onSuccess: () => {
        router.refresh();
      },
    });
  };

  const handleDelete = () => {
    // The hook already captures notificationId, no need to pass it
    deleteMutation(undefined, {
      onSuccess: () => {
        router.refresh();
        toast.success("Notification deleted");
      },
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(notification.content);
    toast.success("Copied to clipboard");
  };

  return (
    <div
      className={cn(
        "group relative bg-white dark:bg-neutral-800 rounded-2xl border transition-all duration-200 shadow-sm",
        notification.isSeen
          ? "border-gray-200 dark:border-neutral-700"
          : "border-gray-300 dark:border-neutral-600",
        isDeleting && "opacity-50 pointer-events-none",
        "hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-neutral-900/50"
      )}
    >
      <div className="p-5">
        <div className="flex gap-4">
          {/* Status Indicator */}
          <div className="flex-shrink-0 mt-0.5">
            {notification.isSeen ? (
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-700 flex items-center justify-center">
                <Check className="w-4 h-4 text-gray-400 dark:text-neutral-500" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-neutral-600 flex items-center justify-center">
                <Circle className="w-3 h-3 text-gray-600 dark:text-neutral-300 fill-current" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-sm leading-relaxed mb-2",
                notification.isSeen
                  ? "text-gray-500 dark:text-neutral-400"
                  : "text-gray-900 dark:text-white font-medium"
              )}
            >
              {notification.content}
            </p>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 dark:text-neutral-500">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                })}
              </span>
              <span className="text-gray-300 dark:text-neutral-700">•</span>
              <span className="text-xs text-gray-400 dark:text-neutral-500">
                {format(new Date(notification.createdAt), "MMM d, h:mm a")}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notification.isSeen && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg"
                onClick={handleMarkAsRead}
                disabled={isMarking}
              >
                {isMarking ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  "Mark read"
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 dark:text-neutral-400 hover:text-gray-600 dark:hover:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg"
              onClick={handleCopy}
            >
              <Link2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
