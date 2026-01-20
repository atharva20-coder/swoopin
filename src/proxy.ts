import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = ["/dashboard", "/api/payment", "/callback"];
const authRoutes = ["/sign-in", "/sign-up"];

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Use Better Auth's getSessionCookie for reliable cookie check
  const sessionCookie = getSessionCookie(req);
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Redirect to sign-in if accessing protected route without auth
  if (isProtectedRoute && !sessionCookie) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // Redirect to dashboard if accessing auth routes while logged in
  if (isAuthRoute && sessionCookie) {
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