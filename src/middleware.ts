import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/cart", "/orders", "/account", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only check protected routes
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (!isProtected) return NextResponse.next();

  // Check if session cookie exists (iron-session cookie)
  const sessionCookie = request.cookies.get("tactical_hub_session");
  if (!sessionCookie?.value) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cart/:path*", "/orders/:path*", "/account/:path*", "/admin/:path*"],
};
