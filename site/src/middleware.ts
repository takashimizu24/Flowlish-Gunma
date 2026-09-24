import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, adminToken } from "@/lib/admin";

/**
 * Admin gate only. The public site is LIVE (the pre-launch Basic-auth gate on
 * the custom domain was removed at launch).
 *
 * /admin and /api/admin — the content-entry area for staff. Protected on EVERY
 * environment/host by a shared password (`ADMIN_PASSWORD`) via a login cookie.
 * /admin/login stays open so people can sign in.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Admin area ------------------------------------------------------------
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (pathname === "/admin/login" || pathname === "/api/admin/login") {
      return NextResponse.next();
    }
    const pw = process.env.ADMIN_PASSWORD;
    const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
    if (pw && cookie && cookie === (await adminToken(pw))) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Public site: open to everyone.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
