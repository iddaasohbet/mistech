import Image from "next/image";
import { buildImportedSlug } from "@/lib/imports";
import { readFile } from "node:fs/promises";
import path from "node:path";

type ImportedItem = {
  id: string;
  title: string;
  brand?: string;
  price?: number;
  image?: string;
  url?: string;
};

type ImportedCategory = {
  category: string;
  url: string;
  items: ImportedItem[];
};

async function loadSamsungImport(): Promise<ImportedCategory[]> {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "samsung-import.json");
    const raw = await readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data as ImportedCategory[];
  } catch {}
  return [];
}

function collectUniqueProducts(cats: ImportedCategory[], limit: number): ImportedItem[] {
  const map = new Map<string, ImportedItem>();
  for (const c of cats) {
    for (const it of c.items || []) {
      if (!map.has(it.id)) map.set(it.id, it);
      if (map.size >= limit) break;
    }
    if (map.size >= limit) break;
  }
  return Array.from(map.values());
}

function labelFromUrl(u: string): string {
  try {
    const url = new URL(u);
    const parts = url.pathname.split("/").filter(Boolean);
    const last = parts.pop() || "";
    const label = decodeURIComponent(last).replace(/[-_]/g, " ").trim();
    if (!label || label.toLowerCase() === "samsung" || label.toLowerCase() === "parts") {
      const prev = parts.pop() || label;
      return decodeURIComponent(prev).replace(/[-_]/g, " ").trim();
    }
    return label;
  } catch {
    return "Kategori";
  }
}

function buildCategoryGroups(cats: ImportedCategory[]) {
  const groups = new Map<string, { label: string; urls: string[]; ids: Set<string> }>();
  for (const c of cats) {
    const label = labelFromUrl(c.url);
    const key = label.toLowerCase();
    if (!c.items || c.items.length === 0) continue;
    if (!groups.has(key)) groups.set(key, { label, urls: [], ids: new Set<string>() });
    const g = groups.get(key)!;
    g.urls.push(c.url);
    for (const it of c.items) {
      if (it?.id) g.ids.add(it.id);
    }
  }
  return Array.from(groups.values())
    .map(g => ({ label: g.label, urls: g.urls, count: g.ids.size }))
    .sort((a, b) => b.count - a.count);
}

export async function SamsungCategoriesSection({ locale }: { locale: string }) {
  const cats = await loadSamsungImport();
  const groups = buildCategoryGroups(cats).slice(0, 24);
  if (groups.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Samsung Kategorileri</h2>
        <a href={`/${locale}/kategori/samsung`} className="text-sm text-muted-foreground hover:underline">Tümünü gör</a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {groups.map((g, i) => (
          <a key={g.label + i} href={`/${locale}/kategori/samsung?model=${encodeURIComponent(g.label)}`} className="rounded-md border p-4 bg-card hover:bg-accent/10 transition">
            <div className="text-sm font-medium line-clamp-2">{g.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{g.count.toLocaleString("tr-TR")} ürün</div>
          </a>
        ))}
      </div>
    </section>
  );
}

import BrandProductsSlider from "./BrandProductsSlider";

export async function SamsungProductsSection({ locale }: { locale: string }) {
  const cats = await loadSamsungImport();
  const products = collectUniqueProducts(cats, 12);
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Samsung Ürünleri</h2>
      </div>
      <BrandProductsSlider
        locale={locale}
        items={products.map((p) => ({ id: p.id, slug: buildImportedSlug(p as any), title: p.title, brand: p.brand, price: p.price, image: p.image }))}
      />
    </section>
  );
}

export default async function SamsungImportSections({ locale }: { locale: string }) {
  return (
    <div>
      {/* Category strip removed as requested */}
      <SamsungProductsSection locale={locale} />
    </div>
  );
}


