// Self-destructing Service Worker
// This replaces the old caching SW to fix the reload loop.
// When the browser fetches this updated sw.js, it will install this new version,
// which immediately clears all caches and unregisters itself.

self.addEventListener("install", (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Clear all caches
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            console.log("[SW] Clearing cache:", name);
            return caches.delete(name);
          }),
        );
      })
      .then(() => {
        console.log("[SW] All caches cleared. Unregistering self...");
        // Unregister this service worker
        return self.registration.unregister();
      })
      .then(() => {
        // Notify all clients to reload once clean
        return self.clients.matchAll();
      })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "SW_DESTROYED" });
        });
      }),
  );
});

// No fetch handler — do not intercept any requests
