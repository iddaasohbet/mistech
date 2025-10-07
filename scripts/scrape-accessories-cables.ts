import { writeFile } from "node:fs/promises";
import { fetch } from "undici";
import * as cheerio from "cheerio";

type Item = { id: string; title: string; brand?: string; price?: number; image?: string; url?: string; description?: string };
type Category = { category: string; url: string; items: Item[] };

function shortHash(input: string): string { let hash = 5381; for (let i = 0; i < input.length; i++) hash = (hash * 33) ^ input.charCodeAt(i); return (hash >>> 0).toString(36).slice(0, 8); }
function parsePriceToCents(text?: string) { if (!text) return undefined; const cleaned = text.replace(/[^0-9,.]/g, "").replace(/\./g, "").replace(",", "."); const n = Number(cleaned); return Number.isFinite(n) ? Math.round(n * 100) : undefined; }
async function fetchHtml(url: string) { const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } }); if (!res.ok) throw new Error(String(res.status)); return await res.text(); }

async function scrapeDetail(url: string): Promise<Partial<Item>> {
  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);
    let title = $("h1, .product-title, #content h1").first().text().trim();
    let image = $("meta[property='og:image']").attr("content") || $(".thumbnails img").attr("src") || $(".product-image img").attr("src") || "";
    let price: number | undefined;
    $("script[type='application/ld+json']").each((_, el) => {
      try { const data = JSON.parse($(el).contents().text() || "null"); const nodes = Array.isArray(data) ? data : [data]; for (const n of nodes) { const t = (n && (n["@type"] || "")).toString().toLowerCase(); if (t.includes("product")) { if (!title) title = n.name || title; const p = n.offers?.price ?? n.price; if (p) { const cleaned = String(p).replace(/[^0-9,.]/g, "").replace(/\./g, "").replace(",", "."); const num = Number(cleaned); if (Number.isFinite(num)) price = Math.round(num * 100); } if (!image) image = n.image || image; } } } catch {} });
    return { title, image, price };
  } catch { return {}; }
}

function brandFromUrl(u: string): string | undefined { try { const s = new URL(u).searchParams.get('fbrand'); return s ? decodeURIComponent(s) : undefined; } catch { return undefined; } }

async function scrapeList(url: string): Promise<{ items: Item[]; next?: string; pages?: string[] }> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const items: Item[] = [];
  const inferredBrand = brandFromUrl(url);
  const seenHrefs = new Set<string>();
  const pushItem = (hrefRaw: string | undefined, title: string, img: string) => {
    if (!hrefRaw) return; let href = hrefRaw; try { href = new URL(href, url).toString(); } catch {}
    if (seenHrefs.has(href)) return; seenHrefs.add(href);
    const id = shortHash(href + "|" + title);
    items.push({ id, title: (title||"").trim(), image: img || "", url: href, brand: inferredBrand });
  };
  $("a.product-thumb, .product-thumb a, .product-grid .product-thumb a, .image a, h4 a, .caption h4 a").each((_, el) => {
    const a = $(el); const href = a.attr("href"); const title = a.text() || a.attr("title") || ""; const img = a.find("img").attr("data-src") || a.find("img").attr("src") || a.closest(".product-thumb, .product-layout").find("img").attr("src") || ""; pushItem(href, title, img);
  });
  $("script[type='application/ld+json']").each((_, el) => { try { const data = JSON.parse($(el).contents().text() || "null"); const nodes = Array.isArray(data) ? data : [data]; for (const n of nodes) { if (!n || (n["@type"] !== "ItemList")) continue; const els = n.itemListElement || []; els.forEach((e: any) => { const u = e?.url || e?.item?.url; const name = e?.name || e?.item?.name; const offer = e?.offers || e?.item?.offers; const price = parsePriceToCents(String(offer?.price ?? "")); const found = items.find(x => x.url === u || x.title === name); if (found && typeof price === 'number') found.price = price; }); } } catch {} });
  const toEnrich = items.filter(x => !x.title || !x.image || typeof x.price !== 'number');
  for (const it of toEnrich) { const det = await scrapeDetail(new URL(it.url!, url).toString()); it.title = it.title || det.title || it.title; it.image = it.image || det.image || it.image; if (typeof det.price === 'number' && typeof it.price !== 'number') it.price = det.price; }
  const pageHrefs = new Set<string>(); $(".pagination a").each((_, el) => { const href = $(el).attr("href"); if (!href || href.startsWith("#")) return; try { pageHrefs.add(new URL(href, url).toString()); } catch {} });
  const nextHref = $(".pagination a[rel='next'], .pagination li.next a, .pagination a").filter((i, el)=>{ const t=$(el).text().trim(); return t==='>'||t==='»'||/next|weiter/i.test(t); }).attr("href");
  const next = nextHref && !nextHref.startsWith("#") ? new URL(nextHref, url).toString() : undefined;
  return { items, next, pages: Array.from(pageHrefs) };
}

async function main() {
  const root = "https://euromobilecompany.de/de/accessories/cables";
  const html = await fetchHtml(root);
  const $ = cheerio.load(html);
  const catLinks = new Set<string>();
  const labelMap = new Map<string, string>();
  // Grab visible sidebar/list group categories with counts and clean labels
  $(".list-group a, .category-list a").each((_, el)=>{
    const href = $(el).attr("href") || ""; if (!href) return;
    const abs = new URL(href, root).toString();
    if (!abs.startsWith(root)) return;
    // Clean text like "Rixus (120)"
    const raw = ($(el).text() || "").replace(/\s+/g,' ').trim();
    const label = raw.replace(/\(.*?\)/g, '').trim();
    catLinks.add(abs);
    if (label) labelMap.set(abs, label);
  });
  const brandFilters = ["For Apple","Samsung","Xiaomi","Huawei","Google","OnePlus","Motorola","Nokia","Realme","Vivo","Sony","LG","Microsoft","Lenovo","ASUS","Wiko","ZTE","Nintendo","Rixus","White label","App","Durata","Orten"];
  const fmFilters = ["44","8","18","61","13","25","1"];
  for (const b of brandFilters) catLinks.add(`${root}?fbrand=${encodeURIComponent(b)}`);
  for (const fm of fmFilters) catLinks.add(`${root}?fm=${fm}`);
  for (const fm of fmFilters) for (const b of brandFilters) catLinks.add(`${root}?fm=${fm}&fbrand=${encodeURIComponent(b)}`);
  // Explicit label mapping provided by user (fm -> label)
  const fmLabel: Record<string, string> = { '44': 'Rixus', '8': 'App', '18': 'Durata', '61': 'Orten', '13': 'Samsung', '25': 'Xiaomi', '1': 'White label' };
  for (const fm of Object.keys(fmLabel)) {
    const u = `${root}?fm=${fm}`;
    labelMap.set(u, fmLabel[fm]);
  }

  const categories: Category[] = [];
  async function crawlCategory(url: string) {
    const b = brandFromUrl(url);
    const fromMap = labelMap.get(url);
    const label = (fromMap && fromMap.trim()) || b || decodeURIComponent(new URL(url).pathname.split("/").filter(Boolean).pop() || "cables");
    const all: Item[] = [];
    const queue: string[] = [url];
    const seen = new Set<string>();
    while (queue.length) {
      const page = queue.shift()!; if (seen.has(page)) continue; seen.add(page);
      const { items, next, pages } = await scrapeList(page);
      items.forEach(it=>{ const withBrand = b && !it.brand ? { ...it, brand: b } : it; if (!all.find(x=>x.id===withBrand.id)) all.push(withBrand); });
      if (pages) for (const p of pages) if (!seen.has(p)) queue.push(p);
      if (next && !seen.has(next)) queue.push(next);
    }
    categories.push({ category: label, url, items: all });
  }

  if (catLinks.size === 0) { await crawlCategory(root); } else { for (const u of Array.from(catLinks)) await crawlCategory(u); }
  await writeFile("public/data/accessories-cables.json", JSON.stringify(categories, null, 2), "utf8");
  const total = categories.reduce((s,c)=>s + c.items.length, 0);
  console.log(`Saved ${categories.length} categories, ${total} items.`);
}

main().catch((e) => { console.error(e); process.exit(1); });


