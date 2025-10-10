import { readFile } from "node:fs/promises";
import path from "node:path";
import { type ImportedCategory, type ImportedItem } from "@/lib/imports";
import { buildImportedSlug } from "@/lib/imports-client";
import FavoritesRow from "@/app/[locale]/(home)/FavoritesRow";
import HomeBannerGrid from "@/app/[locale]/(home)/HomeBannerGrid";
import { FeaturedCategories } from "@/app/[locale]/(home)/sections";

async function load(file: string): Promise<ImportedCategory[]> {
  try { const fp=path.join(process.cwd(),"public","data",file); const raw=await readFile(fp,"utf8"); const data=JSON.parse(raw); return Array.isArray(data)? data: []; } catch { return []; }
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export default async function HomeAllProducts({ locale }: { locale: string }) {
  const files = [
    "apps-import.json","samsung-import.json","oppo-import.json","xiaomi-import.json","huawei-import.json","oneplus-import.json","realme-import.json","google-import.json","motorola-import.json","nokia-import.json","vivo-import.json","sony-import.json","lg-import.json","microsoft-import.json","lenovo-import.json","asus-import.json","wiko-import.json","zte-import.json","nintendo-import.json",
    // accessories
    "accessories-screen-protectors.json","accessories-cases-and-covers.json","accessories-holders.json","accessories-cables.json","accessories-chargers.json","accessories-audio.json","accessories-data-storage.json"
  ];
  const allCats = (await Promise.all(files.map(load))).flat();
  const pool: ImportedItem[] = [];
  for (const c of allCats) for (const it of c.items||[]) if (!pool.find(x=>x.id===it.id)) pool.push(it);
  const featured = pickRandom(pool, 15);
  return (
    <>
      <FavoritesRow locale={locale} />
      <HomeBannerGrid locale={locale} />
      {/* Auto-rotating categories with icons */}
      <FeaturedCategories base={`/${locale}`} />
      {/* Replace slider with 5x3 grid (15 items) */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Öne Çıkan Ürünler</h2>
          <a href={`/${locale}/urunler`} className="text-sm text-muted-foreground hover:text-foreground">Tümünü Gör →</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {featured.map((p) => (
            <a key={p.id} href={`/${locale}/urun/${buildImportedSlug(p)}`}
              className="group rounded-lg border bg-card hover:shadow-sm transition overflow-hidden">
              <div className="relative aspect-[4/5] bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image || "/next.svg"} alt={p.title} className="h-full w-full object-contain p-3 mix-blend-darken" />
              </div>
              <div className="p-2.5">
                {p.brand && <div className="text-xs text-muted-foreground mb-0.5">{p.brand}</div>}
                <div className="text-sm font-medium line-clamp-2 min-h-[40px]">{p.title}</div>
                {typeof p.price === 'number' && (
                  <div className="mt-1 font-semibold text-sm">₺ {(p.price / 100).toLocaleString('tr-TR')}</div>
                )}
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}


