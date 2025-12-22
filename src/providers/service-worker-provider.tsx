"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/register-sw";

/**
 * Service Worker Provider
 * Registers the service worker on mount for asset caching
 */
export default function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only register in production
    if (process.env.NODE_ENV === "production") {
      registerServiceWorker();
    }
  }, []);

  return <>{children}</>;
}
