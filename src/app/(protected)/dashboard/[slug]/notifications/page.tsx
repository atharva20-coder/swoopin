"use client";

import { useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { Bell, Loader, Filter } from "lucide-react";
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
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const filteredNotifications = [...(notifications || [])].filter((n) => {
    if (filter === "unread") return !n.isSeen;
    if (filter === "read") return n.isSeen;
    return true;
  });

  const sortedNotifications = filteredNotifications.sort((a, b) => {
    return sortOrder === "desc"
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const unreadCount = notifications?.filter((n) => !n.isSeen).length || 0;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col h-full">
        {/* Header - Fixed */}
        <div className="py-6 flex-shrink-0">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Bell className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "You're all caught up"}
              </p>
            </div>
          </div>

          {/* Controls - Fixed */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center bg-white dark:bg-neutral-800 rounded-xl p-1 border border-gray-200 dark:border-neutral-700 shadow-sm dark:shadow-neutral-900/50">
              {[
                { value: "all", label: "All" },
                { value: "unread", label: "Unread" },
                { value: "read", label: "Read" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    filter === tab.value
                      ? "bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200"
                  }`}
                >
                  {tab.label}
                  {tab.value === "unread" && unreadCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <Select
              value={sortOrder}
              onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
            >
              <SelectTrigger className="w-[160px] bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 rounded-xl shadow-sm dark:shadow-neutral-900/50">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-neutral-300 text-sm">
                    {sortOrder === "desc" ? "Newest" : "Oldest"}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest first</SelectItem>
                <SelectItem value="asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notifications List - Scrollable Only */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-3 pb-4">
            {sortedNotifications && sortedNotifications.length > 0 ? (
              sortedNotifications.map((notification: Notification) =>
                notification ? (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ) : null
              )
            ) : (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 p-12 text-center shadow-sm dark:shadow-neutral-900/50">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-neutral-700 flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400 dark:text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {filter === "unread"
                    ? "No unread notifications"
                    : filter === "read"
                      ? "No read notifications"
                      : "No notifications yet"}
                </h3>
                <p className="text-gray-500 dark:text-neutral-400 text-sm">
                  {filter === "unread"
                    ? "You've read all your notifications!"
                    : "When you receive notifications, they'll appear here."}
                </p>
              </div>
            )}

            {/* Load More */}
            {hasNextPage && (
              <Button
                variant="ghost"
                className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-300 font-medium h-12 rounded-xl shadow-sm dark:shadow-neutral-900/50"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  "Load more notifications"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}