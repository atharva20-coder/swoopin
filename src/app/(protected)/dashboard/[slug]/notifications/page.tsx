"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useNotifications } from "../../../../../hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Link2, ChevronDown, Loader, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Notification } from "@prisma/client";

export default function NotificationsPage() {
  const { notifications, markAsSeen, deleteMutation, isDeleting, isMarking } =
    useNotifications();
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const sortedNotifications = [...(notifications || [])].sort((a, b) => {
    return sortOrder === "desc"
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div className="min-h-screen   text-white ">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mb-7  ">
          <Select
            value={sortOrder}
            onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
          >
            <SelectTrigger className="w-[180px] bg-transparent border-gray-800">
              <div className="flex items-center">
                <ChevronDown className="mr-2 h-4 w-4" />
                <span>Sort by Date</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest first</SelectItem>
              <SelectItem value="asc">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {sortedNotifications && sortedNotifications.length > 0 ? (
            sortedNotifications.map((notification: Notification) => (
              <div
                key={notification.id}
                className="bg-[#1C1C1C] border border-gray-800 rounded-lg p-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm text-gray-200 mb-1">Notification</h3>
                    <p className="text-xs text-gray-400 mb-3">
                      {format(
                        new Date(notification.createdAt),
                        "MMM d, yyyy, h:mm:ss aa"
                      )}
                    </p>
                    <p className="text-sm text-gray-300">
                      {notification.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.isSeen && (
                      <button
                        onClick={() => {
                          markAsSeen({ id: notification.id });
                        }}
                        disabled={isMarking}
                        className="px-2 py-1 text-xs bg-blue-500/10 text-blue-400 rounded-full"
                      >
                        {isMarking ? (
                          <Loader className="animate-spin" size={16} />
                        ) : (
                          "Unread"
                        )}
                      </button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-white"
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
                      className="text-gray-400 hover:text-white"
                      onClick={() => {
                        deleteMutation({ id: notification.id });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">
              No notifications found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}