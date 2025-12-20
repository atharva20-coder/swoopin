import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/api/payment", "/callback"];
const authRoutes = ["/sign-in", "/sign-up"];

export default async function middleware(req: NextRequest) {
  // Better Auth uses different cookie names in production (HTTPS) vs development
  // Check both the secure prefix version and regular version
  const token = req.cookies.get("__Secure-better-auth.session_token")?.value 
    || req.cookies.get("better-auth.session_token")?.value;
  const pathname = req.nextUrl.pathname;
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Redirect to sign-in if accessing protected route without auth
  if (isProtectedRoute && !token) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // Redirect to dashboard if accessing auth routes while logged in
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals, static files, and auth API
    "/((?!_next|api/auth|.*\\..*).*)",
  ],
};