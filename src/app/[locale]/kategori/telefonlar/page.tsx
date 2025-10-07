import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { prisma } from "@/lib/db";
import productsStatic from "@/../public/data/products.json";
import { DEMO_EXPORT } from "@/lib/demo";
import { PHONE_BRANDS } from "@/data/brands";

export const dynamic = "force-static";

export default async function PhonesCategoryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  const sp = await searchParams;
  const brand = typeof sp?.marka === "string" ? sp.marka : undefined;
  const sub = typeof sp?.alt === "string" ? sp.alt : undefined;
  const products = DEMO_EXPORT
    ? (productsStatic as any[]).filter((p) => !brand || p.brand === brand)
    : await prisma.product.findMany({ where: { category: { slug: "telefonlar" }, ...(brand ? { brand } : {}) }, take: 24 });
  return (
    <div className="grid gap-8 md:grid-cols-[260px_1fr]">
      <aside className="space-y-6">
        <div>
          <div className="font-medium mb-2">Marka</div>
          <div className="space-y-2 max-h-64 overflow-auto pr-1">
            {PHONE_BRANDS.map((b) => (
              <a key={b} href={`?marka=${encodeURIComponent(b)}${sub ? `&alt=${encodeURIComponent(sub)}` : ""}`} className="flex items-center gap-2 text-sm">
                <Checkbox checked={b === brand} /> {b}
              </a>
            ))}
          </div>
        </div>
        <div>
          <div className="font-medium mb-2">Fiyat</div>
          <Slider defaultValue={[50]} max={100} step={1} />
        </div>
        <div>
          <div className="font-medium mb-2">Alt Kategoriler</div>
          <div className="space-y-2">
            {["Kılıf","Ekran Koruyucu","Batarya","Kamera","Şarj Cihazı"].map((s) => (
              <a key={s} href={`?${brand ? `marka=${encodeURIComponent(brand)}&` : ""}alt=${encodeURIComponent(s)}`} className="flex items-center gap-2 text-sm">
                <Checkbox checked={s === sub} /> {s}
              </a>
            ))}
          </div>
        </div>
      </aside>
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">120 ürün</div>
          <Select defaultValue="popular">
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Sırala" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="new">En yeni</SelectItem>
              <SelectItem value="popular">En çok satan</SelectItem>
              <SelectItem value="price-asc">En düşük fiyat</SelectItem>
              <SelectItem value="price-desc">En yüksek fiyat</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.id} className="border rounded-lg p-4">
              <div className="aspect-square bg-muted rounded mb-3" />
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-muted-foreground">{p.brand}</div>
              <div className="mt-2 font-semibold">₺ {(p.price / 100).toLocaleString("tr-TR")}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


