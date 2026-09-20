import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Pre-launch access gate, decided per hostname.
 *
 *  - Local development (`next dev`): always open.
 *  - `*.vercel.app` (the working/preview URL, e.g. flowlish-gunma.vercel.app):
 *    PUBLIC — no password. Share this link freely before launch.
 *  - The custom domain(s) (flowlish3x3.com / www): PRIVATE — HTTP Basic Auth,
 *    password from the `SITE_PASSWORD` env var (Vercel → Settings → Env Vars),
 *    username ignored. Fail-closed: if `SITE_PASSWORD` is unset the custom
 *    domain is fully blocked, so it can never go public by accident.
 *
 * At launch: delete this file to make every hostname public.
 */
export function middleware(req: NextRequest) {
  // Open in local dev so `npm run dev` needs no password.
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

  // The Vercel-hosted URL is the public preview — let it through.
  const host = req.headers.get("host") ?? "";
  if (host.endsWith(".vercel.app")) return NextResponse.next();

  // Custom domain(s) stay private behind a password.
  const expected = process.env.SITE_PASSWORD;
  const auth = req.headers.get("authorization");

  if (expected && auth?.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6)); // "user:password"
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

// Gate everything except Next.js build assets and the favicon.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
