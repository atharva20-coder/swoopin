"use client";
import { Button } from "@/components/ui/button";
import {
  useUserUnseenNotifications,
  useNotifications,
} from "@/hooks/use-notifications";
import { Bell, Loader } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import NotificationItem from "../notification-item";
import { Notification } from "@prisma/client";

export const Notifications = ({ slug }: { slug: string }) => {
  const router = useRouter();
  const { notifications } = useUserUnseenNotifications();
  const { notifications: popoverNotifications, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotifications();

  const unSeenNotification = notifications?.filter((n: Notification) => n.isSeen === false);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative p-2 hover:bg-transparent dark:hover:bg-transparent">
          <Bell className="w-12 h-12 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 stroke-2" />
          {unSeenNotification && unSeenNotification?.length > 0 ? (
            <span className="absolute text-white font-semibold bg-blue-800 dark:bg-blue-600 -top-2 -right-1 size-5 flex items-center justify-center rounded-full text-xs">
              {unSeenNotification?.length}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] shadow-border rounded-md p-0 shadow-md border border-border bg-background dark:bg-gray-900">
        <div className="flex items-center justify-between p-4 bg-muted dark:bg-gray-800/50">
          <h3 className="font-semibold text-lg text-foreground dark:text-gray-100">
            Notifications
          </h3>
          <Button
            variant="ghost"
            className="text-sm text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-100"
            onClick={() => router.push(`/dashboard/${slug}/notifications`)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </Button>
        </div>
        <div className="scrollbar-thumb overflow-y-auto max-h-[350px] min-h-[95px] bg-background dark:bg-gray-900">
          <div className="space-y-0.5">
            {popoverNotifications?.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground dark:text-gray-400">
                No notifications yet
              </div>
            ) : (
              <>
                {popoverNotifications?.map((notification) => (
                  notification && (
                    <NotificationItem
                      notification={notification}
                      key={notification?.id || `notification-${Math.random()}`}
                    />
                  )
                ))}
                {hasNextPage && (
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground font-medium h-12"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      "Load more"
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};