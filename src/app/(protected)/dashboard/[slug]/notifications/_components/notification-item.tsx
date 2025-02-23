import { Button } from "@/components/ui/button";
import { useNotificationsMutation } from "@/hooks/use-notifications";
import { Notification } from "@prisma/client";
import { Link2, Loader, Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Props = {
  notification: Notification;
};

const NotificationItem = ({ notification }: Props) => {
  const router = useRouter();
  const { deleteMutation, isDeleting, isMarking, markAsSeen } =
    useNotificationsMutation(notification.id);

  return (
    <div
      key={notification.id}
      className={cn(
        "group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 transition-all duration-300 border border-gray-200 hover:border-gray-300 rounded-xl p-5 shadow-sm",
        isDeleting && "opacity-50"
      )}
    >
      <div className="flex justify-between items-start gap-4 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-sm font-semibold text-gray-900 leading-tight">
              {notification.content}
            </h3>
            {!notification.isSeen && (
              <button
                onClick={() =>
                  markAsSeen(
                    { id: notification.id },
                    {
                      onSuccess: () => {
                        router.refresh();
                      },
                    }
                  )
                }
                disabled={isMarking}
                className="relative px-3 py-1 text-[11px] font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 rounded-full transition-all duration-200 flex items-center gap-2"
              >
                {isMarking ? (
                  <Loader className="animate-spin" size={12} />
                ) : (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    mark as read
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-xs font-medium text-gray-500 mb-1">
            {format(
              new Date(notification.createdAt),
              "MMM d, yyyy 'at' h:mm a"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(notification.content);
              toast("Copied notification content.");
            }}
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            onClick={() => {
              deleteMutation(
                { id: notification.id },
                {
                  onSuccess: () => {
                    router.refresh();
                  },
                }
              );
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

export default NotificationItem;