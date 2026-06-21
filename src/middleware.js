import { NextResponse } from "next/server";

const ADMIN_COOKIE = "digifox_admin_session";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes except login and auth APIs
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";
  const isAdminApiAuthRoute =
    pathname === "/api/admin/auth/login" || pathname === "/api/admin/auth/logout";

  if (!isAdminRoute || isLoginRoute || isAdminApiAuthRoute) {
    return NextResponse.next();
  }

  const session = request.cookies.get(ADMIN_COOKIE)?.value;
  if (session === "authenticated") {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
