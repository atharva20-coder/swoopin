/**
 * Service Worker registration utility
 * Registers the service worker for asset caching
 */

/**
 * Check if service workers are supported
 */
const isSupported = () => 
  typeof window !== "undefined" && "serviceWorker" in navigator;

/**
 * Register the service worker
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isSupported()) {
    console.log("Service Workers not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    // Handle updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // New content is available, you could prompt user to refresh
            console.log("New content available, refresh to update");
          }
        });
      }
    });

    console.log("Service Worker registered successfully");
    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    return null;
  }
};

/**
 * Unregister all service workers
 */
export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!isSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log("Service Worker unregistered");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Service Worker unregistration failed:", error);
    return false;
  }
};

/**
 * Clear service worker caches
 */
export const clearServiceWorkerCache = async (): Promise<void> => {
  if (!isSupported()) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.active) {
      registration.active.postMessage("clearCache");
    }
    
    // Also clear from the main thread
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      console.log("Service Worker caches cleared");
    }
  } catch (error) {
    console.error("Failed to clear SW cache:", error);
  }
};

/**
 * Check if service worker is active
 */
export const isServiceWorkerActive = (): boolean => {
  return isSupported() && !!navigator.serviceWorker.controller;
};
