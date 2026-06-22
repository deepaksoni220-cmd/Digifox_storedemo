import { NextResponse } from "next/server";
import { verifySessionToken } from "./lib/adminAuth";

const ADMIN_COOKIE = "digifox_admin_session";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ── Determine route type ──────────────────────────────────────────────────
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi  = pathname.startsWith("/api/admin");
  const isLoginPage = pathname === "/admin/login";
  const isAuthApi   =
    pathname === "/api/admin/auth/login" || pathname === "/api/admin/auth/logout";

  // Skip non-admin routes, login page, and auth endpoints
  if ((!isAdminPage && !isAdminApi) || isLoginPage || isAuthApi) {
    return NextResponse.next();
  }

  // ── Verify session token ──────────────────────────────────────────────────
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const isValid = await verifySessionToken(token);

  if (isValid) {
    return NextResponse.next();
  }

  // ── Unauthorized ──────────────────────────────────────────────────────────
  if (isAdminApi) {
    // API routes: return 401 JSON
    return NextResponse.json(
      { error: "Unauthorized. Please log in." },
      { status: 401 }
    );
  }

  // Page routes: redirect to login
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
