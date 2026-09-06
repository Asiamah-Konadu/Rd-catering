import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Target Launch Date: November 6, 2026, 09:00:00 GMT
const LAUNCH_TIMESTAMP = new Date("2026-11-06T09:00:00Z").getTime();

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const now = Date.now();

  // If before launch date, restrict public ordering pages
  if (now < LAUNCH_TIMESTAMP) {
    // Check if staff/admin preview bypass is requested
    const hasPreviewParam = request.nextUrl.searchParams.get("preview") === "true";
    const authSessionCookie =
      request.cookies.get("next-auth.session-token") ||
      request.cookies.get("__Secure-next-auth.session-token");

    if (hasPreviewParam || authSessionCookie) {
      return NextResponse.next();
    }

    // Block public access to menu, cart, checkout, order
    const restrictedPrefixes = ["/menu", "/cart", "/checkout", "/order"];
    const isRestricted = restrictedPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (isRestricted) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/menu/:path*",
    "/cart",
    "/checkout",
    "/order/:path*",
  ],
};
