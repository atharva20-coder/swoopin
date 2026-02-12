# Future PWA Strategy: Migrating to `next-pwa`

To restore offline capabilities and installability without causing reload loops on Vercel, we should migrate to `next-pwa`. This library is battle-tested with Next.js and handles the complexities of caching, lifecycle management, and Vercel compatibility (header config, etc.) automatically.

## 1. Installation

```bash
npm install next-pwa
# or
yarn add next-pwa
# or
bun add next-pwa
```

## 2. Configuration (`next.config.mjs`)

Wrap your existing Next.js config with `next-pwa`.

```javascript
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Disable in dev to avoid annoying caching
  // Important for Vercel:
  buildExcludes: [/middleware-manifest\.json$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... your existing config
};

export default withPWA(nextConfig);
```

## 3. Ignore Generated Files

Add the following to `.gitignore`:

```text
# PWA files
public/sw.js
public/workbox-*.js
public/worker-*.js
```

## 4. Updates to `src/app/layout.tsx` (or `manifest.ts`)

Ensure your metadata is correct. You already have a `manifest.ts`, so that remains fine. You might want to add a viewport export if not present:

```typescript
export const viewport: Viewport = {
  themeColor: "#4F46E5",
};
```

## 5. Cleaning Up Manual Code

Once `next-pwa` is installed:

1.  **Delete** the manual `src/providers/service-worker-provider.tsx`.
2.  **Delete** the manual `src/lib/register-sw.ts`.
3.  **Delete** the manual `public/sw.js` (it will be auto-generated).

## Why this is better

- **Cache Strategy**: `next-pwa` (via Workbox) has proven strategies for StaleWhileRevalidate, CacheFirst, etc., that don't conflict with Vercel's edge caching.
- **Reload Loop Prevention**: It handles the `controlling` state change more gracefully/standardly than our manual implementation did.
