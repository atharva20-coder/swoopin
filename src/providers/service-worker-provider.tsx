"use client";

import { useEffect } from "react";

/**
 * Service Worker Provider
 * Unregisters any stale service workers and clears caches.
 */
export default function ServiceWorkerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const cleanup = async () => {
      try {
        // 1. Unregister all service workers
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }

        // 2. Clear all caches
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      } catch {
        // Silent fail — cleanup is best-effort
      }
    };

    cleanup();
  }, []);

  return <>{children}</>;
}
