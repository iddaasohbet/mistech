"use client";
import TopBar from "@/components/TopBar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import CookieConsent from "@/components/CookieConsent";
import SupportWidget from "@/components/SupportWidget";
import { usePathname } from "next/navigation";

export default function SiteChrome({ locale, children }: { locale: string; children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const isAdmin = pathname.includes("/admin");
  return (
    <>
      {!isAdmin && (
        <div className="site-chrome">
          {/* Top bar removed per request */}
          <SiteHeader locale={locale} />
        </div>
      )}
      {children}
      {!isAdmin && (
        <div className="site-chrome">
          <SiteFooter locale={locale} />
          <CookieConsent />
          <SupportWidget />
        </div>
      )}
    </>
  );
}


