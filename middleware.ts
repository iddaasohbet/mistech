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
    // Prefer Geo-IP country DE -> de, else Accept-Language, else default
    const headers = (req as any).headers;
    const country = headers.get("x-vercel-ip-country") || headers.get("x-country") || "";
    const accept = headers.get("accept-language") || "";

    let target: string = defaultLocale;
    if (/^DE$/i.test(country)) target = "de";
    else if (/\bde\b/i.test(accept)) target = "de";
    else if (/\ben\b/i.test(accept)) target = "en";
    else target = defaultLocale;

    if (!locales.includes(target as any)) target = defaultLocale;
    return NextResponse.redirect(new URL(`/${target}`, url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/(tr|en|de)/:path*"]
};

