import { readFile } from "node:fs/promises";
import path from "node:path";
import { type ImportedCategory, type ImportedItem } from "@/lib/imports";
import { buildImportedSlug } from "@/lib/imports-client";
import FavoritesRow from "@/app/[locale]/(home)/FavoritesRow";
import HomeBannerGrid from "@/app/[locale]/(home)/HomeBannerGrid";
import { FeaturedCategories } from "@/app/[locale]/(home)/sections";
import ListingCard from "@/components/ListingCard";

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
          {featured.map((p, idx) => (
            <ListingCard
              key={p.id}
              index={idx}
              href={`/${locale}/urun/${buildImportedSlug(p)}`}
              title={p.title}
              brand={p.brand}
              image={p.image}
              badge={{ label: "Schnelle Lieferung" }}
            />
          ))}
        </div>
      </section>
    </>
  );
}


