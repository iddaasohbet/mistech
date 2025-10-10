"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
// compact, pro categories menu: only imported brands
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import AuthMenu from "@/components/AuthMenu";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ShoppingCart, Heart } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import MobileMenu from "@/components/MobileMenu";

export function SiteHeader({ locale }: { locale: string }) {
  const pathname = usePathname();
  const base = `/${locale}`;
  const t = useTranslations('nav');

  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Hide on scroll down, show on scroll up (works on mobile & desktop)
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      setIsScrolled(y > 10);
      // small threshold to avoid jitter
      if (Math.abs(y - last) > 6) {
        setIsHidden(y > 64 && y > last);
        last = y;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true } as any);
    return () => window.removeEventListener('scroll', onScroll as any);
  }, []);

  const headerClassName = [
    "fixed top-0 z-50 w-full bg-white text-foreground transition-transform duration-300 ease-out",
    isHidden ? "-translate-y-full" : "translate-y-0",
    isScrolled ? "shadow-sm" : ""
  ].join(" ");
  
  return (
    <>
    <header className={headerClassName}>
      {/* Mobile language area */}
      <div className="md:hidden bg-neutral-50/80 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl px-4 h-11 flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">Dil / Language</span>
          <LanguageSwitcher />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 md:px-6 h-16 flex items-center gap-4 relative border-b">
        {/* Left: Mobile hamburger + desktop categories */}
        <div className="flex items-center gap-2">
          <div className="md:hidden flex items-center gap-1">
            <MobileMenu base={base} triggerClassName="inline-flex items-center justify-center size-10 rounded-md border bg-background -ml-2" />
            <Link href={`${base}/hesap/favoriler`} aria-label="Favoriler" className="inline-flex items-center justify-center size-10 rounded-md border bg-background">
              <Heart className="size-5" />
            </Link>
          </div>
          <Link href={base} className="inline-flex items-center gap-2 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0" aria-label="mistech.de anasayfa">
            <Image src="https://hizliresimle.com/i/i68e13e6f862eb" alt="logo" width={150} height={40} className="h-10 md:h-12 w-auto" />
          </Link>
          <div className="hidden md:block">
          <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href={`${base}/urunler`} className="px-3 py-2 rounded-md border border-neutral-200 bg-transparent text-foreground hover:bg-neutral-50">
                  {t('products')}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-foreground bg-transparent border border-neutral-200 hover:bg-neutral-50 data-[state=open]:bg-neutral-50">
                {t('categories')}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="p-6 w-[720px] max-h-[70vh] overflow-auto">
                  <div className="mb-3 font-medium">{t('brandsImported')}</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {[
                      { slug: "app", name: "Apple" },
                      { slug: "samsung", name: "Samsung" },
                      { slug: "oppo", name: "OPPO" },
                      { slug: "xiaomi", name: "Xiaomi" },
                      { slug: "huawei", name: "Huawei" },
                      { slug: "oneplus", name: "OnePlus" },
                      { slug: "realme", name: "Realme" },
                      { slug: "google", name: "Google" },
                      { slug: "motorola", name: "Motorola" },
                      { slug: "nokia", name: "Nokia" },
                      { slug: "vivo", name: "Vivo" },
                      { slug: "sony", name: "Sony" },
                      { slug: "lg", name: "LG" },
                      { slug: "microsoft", name: "Microsoft" },
                      { slug: "lenovo", name: "Lenovo" },
                      { slug: "asus", name: "ASUS" },
                      { slug: "wiko", name: "Wiko" },
                      { slug: "zte", name: "ZTE" },
                      { slug: "nintendo", name: "Nintendo" },
                    ].map((b) => (
                      <NavigationMenuLink key={b.slug} asChild>
                        <Link href={`${base}/kategori/${b.slug}`} className="inline-flex items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm hover:bg-neutral-100">
                          {b.name} {t('parts')}
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                  <div className="mt-6 mb-3 font-medium">{t('accessories')}</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {[
                      { slug: "accessories", key: "screenProtectors", query: "type=screen-protectors" },
                      { slug: "accessories", key: "casesCovers", query: "type=cases-and-covers" },
                      { slug: "accessories", key: "holders", query: "type=holders" },
                      { slug: "accessories", key: "cables", query: "type=cables" },
                      { slug: "accessories", key: "chargers", query: "type=chargers" },
                      { slug: "accessories", key: "audio", query: "type=audio" },
                      { slug: "accessories", key: "storage", query: "type=data-storage" },
                    ].map((a)=> (
                      <NavigationMenuLink key={a.key} asChild>
                        <Link href={`${base}/kategori/${a.slug}?${a.query}`} className="inline-flex items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm hover:bg-neutral-100">
                          {t(a.key)}
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
          </NavigationMenu>
          </div>
        </div>
        <div className="flex-1 hidden md:flex justify-center">
          <SearchBar base={base} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          <Button variant="outline" size="icon" asChild className="bg-white hover:bg-neutral-50 border-neutral-200 text-foreground">
            <Link href={`${base}/sepet`} aria-label={t('cart')}>
              <ShoppingCart className="size-5" />
            </Link>
          </Button>
          <div className="[&_button]:bg-white [&_button]:hover:bg-neutral-50 [&_button]:border-neutral-200 [&_button]:text-foreground">
            <AuthMenu base={base} />
          </div>
        </div>
      </div>
    </header>
    {/* offset for fixed header */}
    <div aria-hidden="true" className="md:h-16 h-[76px]" />
    </>
  );
}


