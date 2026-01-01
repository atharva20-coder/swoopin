/**
 * Instagram Image Proxy
 * 
 * Proxies Instagram CDN images to bypass CORS restrictions.
 * SECURITY: Only allows requests to verified Instagram/Meta CDN domains.
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Allowed Instagram/Meta CDN hostnames.
 * These are the only domains we will proxy to.
 */
const ALLOWED_HOSTNAME_PATTERNS = [
  // Instagram CDN patterns
  /^scontent[-\w]*\.cdninstagram\.com$/,
  /^scontent[-\w]*\.xx\.fbcdn\.net$/,
  /^instagram\.[\w]+\.fna\.fbcdn\.net$/,
  /^video[-\w]*\.cdninstagram\.com$/,
  /^[\w-]+\.instagram\.com$/,
  // Facebook CDN (used by Instagram)
  /^scontent[-\w]*\.fbcdn\.net$/,
  /^video[-\w]*\.xx\.fbcdn\.net$/,
];

/**
 * Validate that a URL is from an allowed Instagram CDN domain
 */
function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    
    // Only allow HTTPS
    if (url.protocol !== "https:") {
      return false;
    }
    
    // Check against allowed hostname patterns
    return ALLOWED_HOSTNAME_PATTERNS.some((pattern) => pattern.test(url.hostname));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");
    
    if (!url) {
      return NextResponse.json(
        { error: "Bad Request", message: "URL parameter is required" },
        { status: 400 }
      );
    }

    // Security: Validate URL is from allowed Instagram CDN domains
    if (!isAllowedUrl(url)) {
      console.warn(`Instagram proxy: Blocked request to unauthorized domain: ${url}`);
      return NextResponse.json(
        { error: "Forbidden", message: "URL domain not allowed" },
        { status: 403 }
      );
    }

    // Fetch the image with appropriate headers
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NinthNode/1.0)",
        "Accept": "image/*,video/*",
        "Accept-Encoding": "gzip, deflate, br",
      },
      // Don't follow redirects to non-allowed domains
      redirect: "manual",
    });

    // Check if we got a redirect
    if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.get("location");
      
      if (redirectUrl && !isAllowedUrl(redirectUrl)) {
        console.warn(`Instagram proxy: Blocked redirect to unauthorized domain: ${redirectUrl}`);
        return NextResponse.json(
          { error: "Forbidden", message: "Redirect to unauthorized domain blocked" },
          { status: 403 }
        );
      }
      
      // Follow allowed redirects
      if (redirectUrl) {
        return NextResponse.redirect(redirectUrl);
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "Upstream Error", message: `Failed to fetch: ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type");
    const buffer = await response.arrayBuffer();

    // Validate content type is media
    const allowedContentTypes = ["image/", "video/"];
    const isAllowedContentType = allowedContentTypes.some(
      (type) => contentType?.startsWith(type)
    );

    if (!isAllowedContentType) {
      return NextResponse.json(
        { error: "Bad Gateway", message: "Invalid content type from upstream" },
        { status: 502 }
      );
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Instagram proxy error:", error);
    return NextResponse.json(
      { error: "Server Error", message: "Failed to proxy media" },
      { status: 500 }
    );
  }
}