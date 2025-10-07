"use client";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, Grid2X2, Headphones, Cable, ShieldCheck, HelpCircle, ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";

export default function MobileMenu({ base, triggerClassName }: { base: string; triggerClassName?: string }) {
  const CloseLink = ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
    <SheetClose asChild>
      <Link href={href} className={className}>{children}</Link>
    </SheetClose>
  );
  const brands = [
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
  ];
  const accessories = [
    { key: "Ekran Koruyucular", query: "type=screen-protectors" },
    { key: "Kılıf & Kapaklar", query: "type=cases-and-covers" },
    { key: "Tutucular", query: "type=holders" },
    { key: "Kablolar", query: "type=cables" },
    { key: "Şarj Aletleri", query: "type=chargers" },
    { key: "Ses Ürünleri", query: "type=audio" },
    { key: "Depolama", query: "type=data-storage" },
  ];
  return (
    <Sheet>
      <SheetTrigger className={triggerClassName ?? "inline-flex items-center justify-center size-10 rounded-md border bg-background -ml-2"} aria-label="Menü">
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-full max-w-none">
        <Tabs defaultValue="explore" className="h-full">
          <SheetHeader className="p-4 border-b sticky top-0 bg-background z-10">
            <SheetTitle className="text-base">Menü</SheetTitle>
            <div className="mt-3">
              <input placeholder="Ara..." className="w-full h-10 px-3 rounded-md border text-sm" />
            </div>
            <div className="mt-3">
              <TabsList className="grid grid-cols-4 gap-2 bg-neutral-100 p-1 rounded-md">
                <TabsTrigger value="explore">Keşfet</TabsTrigger>
                <TabsTrigger value="brands">Markalar</TabsTrigger>
                <TabsTrigger value="accessories">Aksesuarlar</TabsTrigger>
                <TabsTrigger value="account">Hesap</TabsTrigger>
              </TabsList>
            </div>
          </SheetHeader>

          <div className="p-4 overflow-y-auto max-h-[calc(100vh-148px)]">
            <TabsContent value="explore" className="m-0">
              <div className="grid grid-cols-2 gap-3">
                <CloseLink href={`${base}/urunler`} className="rounded-2xl border p-4 bg-white hover:bg-neutral-50 flex items-center gap-3">
                  <Grid2X2 className="size-5" />
                  <div className="text-sm font-medium">Tüm Ürünler</div>
                </CloseLink>
                <CloseLink href={`${base}/kategori/accessories?type=screen-protectors`} className="rounded-2xl border p-4 bg-white hover:bg-neutral-50 flex items-center gap-3">
                  <ShieldCheck className="size-5" />
                  <div className="text-sm font-medium">Ekran Koruyucular</div>
                </CloseLink>
                <CloseLink href={`${base}/kategori/accessories?type=audio`} className="rounded-2xl border p-4 bg-white hover:bg-neutral-50 flex items-center gap-3">
                  <Headphones className="size-5" />
                  <div className="text-sm font-medium">Ses Ürünleri</div>
                </CloseLink>
                <CloseLink href={`${base}/kategori/accessories?type=cables`} className="rounded-2xl border p-4 bg-white hover:bg-neutral-50 flex items-center gap-3">
                  <Cable className="size-5" />
                  <div className="text-sm font-medium">Kablolar</div>
                </CloseLink>
                <CloseLink href={`${base}/hakkimizda`} className="rounded-2xl border p-4 bg-white hover:bg-neutral-50 flex items-center gap-3">
                  <HelpCircle className="size-5" />
                  <div className="text-sm font-medium">Yardım</div>
                </CloseLink>
              </div>
            </TabsContent>

            <TabsContent value="brands" className="m-0">
              <div className="grid grid-cols-3 gap-3">
                {brands.map((b) => {
                  const iconSlug = b.slug === "app" ? "apple" : b.slug;
                  return (
                    <CloseLink key={b.slug} href={`${base}/kategori/${b.slug}`} className="rounded-2xl border p-3 bg-white hover:bg-neutral-50 flex flex-col items-center gap-2">
                      <img alt={b.name} src={`https://cdn.simpleicons.org/${iconSlug}/6b7280`} className="h-6 w-auto" />
                      <div className="text-xs font-medium text-center">{b.name}</div>
                    </CloseLink>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="accessories" className="m-0">
              <div className="grid grid-cols-2 gap-3">
                {accessories.map((a) => (
                  <CloseLink key={a.key} href={`${base}/kategori/accessories?${a.query}`} className="rounded-2xl border p-4 bg-white hover:bg-neutral-50 text-sm font-medium">
                    {a.key}
                  </CloseLink>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="account" className="m-0">
              <div className="grid grid-cols-2 gap-3">
                <CloseLink href={`${base}/hesap/favoriler`} className="rounded-2xl border p-4 bg-white hover:bg-neutral-50 text-sm font-medium">Favoriler</CloseLink>
                <CloseLink href={`${base}/sepet`} className="rounded-2xl border p-4 bg-white hover:bg-neutral-50 text-sm font-medium">Sepet</CloseLink>
                <CloseLink href={`${base}/hakkimizda`} className="rounded-2xl border p-4 bg-white hover:bg-neutral-50 text-sm font-medium">Hakkımızda</CloseLink>
                <CloseLink href={`${base}/iletisim`} className="rounded-2xl border p-4 bg-white hover:bg-neutral-50 text-sm font-medium">İletişim</CloseLink>
              </div>
            </TabsContent>
          </div>

          <div className="sticky bottom-0 bg-background border-t p-3 grid grid-cols-3 gap-2">
            <CloseLink href={`${base}/urunler`} className="inline-flex items-center justify-center gap-2 h-11 rounded-full border bg-white hover:bg-neutral-50 text-sm font-medium">
              <Grid2X2 className="size-4" /> Tüm Ürünler
            </CloseLink>
            <CloseLink href={`${base}/sepet`} className="inline-flex items-center justify-center gap-2 h-11 rounded-full border bg-white hover:bg-neutral-50 text-sm font-medium">
              <ShoppingCart className="size-4" /> Sepet
            </CloseLink>
            <CloseLink href={`${base}/hesap/favoriler`} className="inline-flex items-center justify-center gap-2 h-11 rounded-full border bg-white hover:bg-neutral-50 text-sm font-medium">
              <Heart className="size-4" /> Favoriler
            </CloseLink>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}


