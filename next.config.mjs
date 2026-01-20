/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable compression (gzip/brotli handled by Vercel/hosting)
  compress: true,

  // Performance optimizations
  reactStrictMode: true,
  poweredByHeader: false, // Remove X-Powered-By header

  // Native modules that need to be external (moved from experimental)
  serverExternalPackages: ["@node-rs/argon2"],

  // Cache headers for edge caching
  async headers() {
    return [
      // Static assets - long cache
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|mp4|ttf|otf|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // API routes - short cache with revalidation
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
      // Webhook routes - no cache (must be fresh)
      {
        source: "/api/webhook/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
      // Security headers for all routes
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      // Instagram domains
      {
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "instagram.frpr5-1.fna.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "scontent-iad3-2.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "scontent-iad3-1.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      // Social Media Platforms
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "*.twimg.com",
      },
      // Other specific domains
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
      {
        protocol: "https",
        hostname: "d365kmhoeske8t.cloudfront.net",
      },
      // Cloud Storage and CDN Providers
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.imgix.net",
      },
      {
        protocol: "https",
        hostname: "*.akamaized.net",
      },
      // Image Hosting Services
      {
        protocol: "https",
        hostname: "*.imgur.com",
      },
      {
        protocol: "https",
        hostname: "*.giphy.com",
      },
      // Fallback for any HTTPS domain (use with caution)
      {
        protocol: "https",
        hostname: "**",
        pathname: "**",
      },
    ],
    // Image optimization configurations
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
