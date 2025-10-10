import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./src/i18n/routing";
import { locales, defaultLocale } from "./src/app/i18n";

// Disable middleware on static export
const intlMiddleware = process.env.DEMO_EXPORT === "1" ? (function () {} as any) : createMiddleware(routing);

export default function middleware(req: Request) {
  // First, run next-intl handling for locale prefixes
  // @ts-ignore - next-intl expects NextRequest but compatible enough here
  const res = intlMiddleware(req);
  if (res) return res;

  // Locale selection for root '/'
  const url = new URL((req as any).url);
  if (url.pathname === "/") {
    // Always land on German site; users can switch language later
    return NextResponse.redirect(new URL(`/de`, url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/(tr|en|de)/:path*"]
};

