import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Site-wide password gate (staging / pre-launch).
 *
 * Behaviour:
 *  - Local development (`next dev`): always open, no prompt.
 *  - Production: requires HTTP Basic Auth. The password is read from the
 *    `SITE_PASSWORD` environment variable (set it in Vercel → Settings →
 *    Environment Variables). Username is ignored — enter anything.
 *  - Fail-closed: if `SITE_PASSWORD` is not set in production, every request is
 *    blocked, so the site can never be public by accident.
 *
 * To make the site public at launch: delete this file (and the SITE_PASSWORD env var).
 */
export function middleware(req: NextRequest) {
  // Open in local dev so `npm run dev` needs no password.
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

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
