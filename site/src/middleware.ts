import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, adminToken } from "@/lib/admin";

/**
 * Two independent gates:
 *
 * 1. /admin and /api/admin — the content-entry area for staff. Protected on
 *    EVERY environment/host by a shared password (`ADMIN_PASSWORD`) via a
 *    login cookie. /admin/login stays open so people can sign in.
 *
 * 2. The public site — pre-launch access control:
 *      - local dev: open
 *      - *.vercel.app (working/preview URL): public
 *      - custom domain (flowlish3x3.com): HTTP Basic Auth (`SITE_PASSWORD`),
 *        fail-closed. Delete this whole gate at launch to go public.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- 1. Admin area ---------------------------------------------------------
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

  // --- 2. Public site gate ---------------------------------------------------
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

  const host = req.headers.get("host") ?? "";
  if (host.endsWith(".vercel.app")) return NextResponse.next();

  const expected = process.env.SITE_PASSWORD;
  const auth = req.headers.get("authorization");
  if (expected && auth?.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      const password = decoded.slice(decoded.indexOf(":") + 1);
      if (password === expected) return NextResponse.next();
    } catch {
      /* fall through to 401 */
    }
  }
  return new NextResponse("このサイトは非公開です / This site is private.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="FLOWLISH GUNMA (private)"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
