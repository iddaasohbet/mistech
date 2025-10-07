import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

// Disable middleware on static export
export default process.env.DEMO_EXPORT === "1" ? function () {} as any : createMiddleware(routing);

export const config = {
  matcher: ["/", "/(tr|en|de)/:path*"]
};

