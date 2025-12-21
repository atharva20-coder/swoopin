"use client";
import React, { useState, useEffect } from "react";
import { X, Bell, Megaphone } from "lucide-react";

type AdminNotification = {
  id: string;
  content: string;
  createdAt: string;
};

export default function AdminNotificationBanner() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load dismissed IDs from localStorage
    const stored = localStorage.getItem("dismissedAdminNotifications");
    if (stored) {
      setDismissedIds(JSON.parse(stored));
    }
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications/admin-banners");
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch admin notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissNotification = (id: string) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem("dismissedAdminNotifications", JSON.stringify(newDismissed));
  };

  // Filter out dismissed notifications
  const visibleNotifications = notifications.filter(
    (n) => !dismissedIds.includes(n.id)
  );

  if (isLoading || visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-4">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className="relative bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl p-4 pr-10 shadow-lg"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-relaxed">
                {notification.content}
              </p>
              <p className="text-xs text-white/70 mt-1">
                {new Date(notification.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => dismissNotification(notification.id)}
            className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
