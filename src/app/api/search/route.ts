import { NextResponse } from "next/server";
import { loadAllImports, buildImportedSlug, type ImportedItem } from "@/lib/imports";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function scoreItem(item: ImportedItem, q: string): number {
  const title = (item.title || "").toLowerCase();
  const brand = (item.brand || "").toLowerCase();
  const s = q.toLowerCase().trim();
  if (!s) return 0;
  let score = 0;
  if (title.includes(s)) score += 6;
  if (brand.includes(s)) score += 4;
  for (const t of s.split(/\s+/).filter(Boolean)) {
    if (t.length < 2) continue;
    if (title.includes(t)) score += 2;
    if (brand.includes(t)) score += 1;
  }
  return score;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const limit = Math.max(1, Math.min(10, Number(url.searchParams.get("limit") || 8)));
  if (!q.trim()) return NextResponse.json({ products: [] });

  const all = await loadAllImports();
  const bucket: ImportedItem[] = [];
  for (const { categories } of all) {
    for (const c of categories) {
      for (const it of c.items || []) bucket.push(it);
    }
  }

  const ranked = bucket
    .map((it) => ({ it, s: scoreItem(it, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ it }) => ({
      id: it.id,
      title: it.title,
      brand: it.brand,
      price: it.price,
      image: it.image,
      slug: buildImportedSlug(it)
    }));

  return NextResponse.json({ products: ranked });
}










