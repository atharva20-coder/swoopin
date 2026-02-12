"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/register-sw";

/**
 * Service Worker Provider
 * Registers the service worker on mount for asset caching
 */
export default function ServiceWorkerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Unregister any existing service workers to fix reload loop issue
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
          console.log("Service Worker unregistered to fix reload loop");
        }
      });
    }
  }, []);

  return <>{children}</>;
}
