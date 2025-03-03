"use client";

import { useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { Link2, ChevronDown, Loader, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Notification } from "@prisma/client";
import NotificationItem from "./_components/notification-item";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const { notifications, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useNotifications();

  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const sortedNotifications = [...(notifications || [])].sort((a, b) => {
    return sortOrder === "desc"
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-4 sm:mb-7">
          <Select
            value={sortOrder}
            onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
          >
            <SelectTrigger className="w-[140px] sm:w-[180px] bg-white border-gray-200">
              <div className="flex items-center">
                <ChevronDown className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-gray-700 text-sm sm:text-base">Sort by Date</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest first</SelectItem>
              <SelectItem value="asc">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {sortedNotifications && sortedNotifications.length > 0 ? (
            sortedNotifications.map((notification: Notification) => (
              notification && (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              )
            ))
          ) : (
            <div className="text-center text-gray-500 py-6 sm:py-8">
              No notifications found.
            </div>
          )}
          {hasNextPage && (
            <Button
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-900 font-medium h-10 sm:h-12"
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
        </div>
      </div>
    </div>
  );
}