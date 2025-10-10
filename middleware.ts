import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./src/i18n/routing";
import { locales, defaultLocale } from "./src/app/i18n";

// Disable middleware on static export
const intlMiddleware = process.env.DEMO_EXPORT === "1" ? (function () {} as any) : createMiddleware(routing);

export default function middleware(req: Request) {
  const url = new URL((req as any).url);
  // Force root (and bare /tr) to /de BEFORE next-intl runs (overrides cookie)
  if (url.pathname === "/" || url.pathname === "/tr" || url.pathname === "/tr/") {
    const res = NextResponse.redirect(new URL(`/de`, url));
    try {
      res.cookies.set("NEXT_LOCALE", "de", { path: "/" });
    } catch {}
    return res;
  }

  // Then let next-intl handle locale-prefixed routes
  // @ts-ignore - next-intl expects NextRequest but compatible enough here
  const res = intlMiddleware(req);
  if (res) return res;
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/(tr|en|de)/:path*"]
};

