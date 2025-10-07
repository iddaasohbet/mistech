import { readFile } from "node:fs/promises";
import path from "node:path";
import { type ImportedCategory, type ImportedItem } from "@/lib/imports";
import FeaturedProductsSlider from "@/app/[locale]/(home)/FeaturedProductsSlider";
import FavoritesRow from "@/app/[locale]/(home)/FavoritesRow";
import HomeBannerGrid from "@/app/[locale]/(home)/HomeBannerGrid";

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
  const featured = pickRandom(pool, 5);
  return (
    <>
      <FavoritesRow locale={locale} />
      <HomeBannerGrid locale={locale} />
      <FeaturedProductsSlider locale={locale} items={featured} />
    </>
  );
}


