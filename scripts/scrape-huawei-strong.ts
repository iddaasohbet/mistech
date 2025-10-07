import { writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import * as cheerio from "cheerio";
import { fetch } from "undici";

type Product = {
  id: string;
  title: string;
  brand?: string;
  price?: number;
  image?: string;
  url?: string;
  description?: string;
};

type CategoryDump = {
  category: string;
  url: string;
  items: Product[];
};

const START_URL = "https://euromobilecompany.de/de/parts/huawei";
const ORIGIN = new URL(START_URL).origin;

function toAbsoluteUrl(href: string): string {
  try {
    if (!href) return "";
    if (href.startsWith("http")) return href;
    if (href.startsWith("/")) return ORIGIN + href;
    return new URL(href, START_URL).toString();
  } catch {
    return "";
  }
}

function normalizeCategoryUrl(u: string): string {
  try {
    if (!u) return "";
    const abs = toAbsoluteUrl(u);
    if (!abs) return "";
    const url = new URL(abs);
    url.search = "";
    url.hash = "";
    let path = url.pathname.replace(/\/+$/, "");
    if (!/\/de\/parts\/huawei(\/|$)/i.test(path)) return "";
    url.pathname = path;
    return url.toString();
  } catch {
    return "";
  }
}

async function getDocument(url: string) {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 scrape-bot" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  return { $, html };
}

function extractText($el: cheerio.Cheerio<any>): string {
  return ($el.text() || "").replace(/\s+/g, " ").trim();
}

function parsePriceToKurus(text: string | undefined): number | undefined {
  if (!text) return undefined;
  const cleaned = text.replace(/[^0-9,\.]/g, "").replace(/\./g, "").replace(",", ".");
  if (!cleaned) return undefined;
  const num = Number(cleaned);
  if (Number.isFinite(num)) return Math.round(num * 100);
  return undefined;
}

function firstAttr($el: cheerio.Cheerio<any>, attrs: string[]): string | undefined {
  for (const a of attrs) {
    const v = $el.attr(a);
    if (v) return v;
  }
  return undefined;
}

function cleanImageUrl(src?: string): string | undefined {
  if (!src) return undefined;
  const s = src.split(" ")[0];
  if (!s) return undefined;
  const lower = s.toLowerCase();
  if (lower.includes("favicon")) return undefined;
  return s;
}

function extractCategoryTitle($: cheerio.CheerioAPI, fallbackUrl: string): string {
  const cand = ["h1", ".page-title", ".category-title", ".breadcrumb + h1"];
  for (const sel of cand) {
    const t = extractText($(sel).first());
    if (t) return t;
  }
  try {
    const { pathname } = new URL(fallbackUrl);
    const last = pathname.split("/").filter(Boolean).pop() || "Kategori";
    return decodeURIComponent(last.replace(/[-_]/g, " ")).trim();
  } catch {
    return "Kategori";
  }
}

async function scrapeProductsFromList(url: string): Promise<{ items: Product[]; nextUrl?: string }> {
  const { $ } = await getDocument(url);

  const itemSelectors = [
    ".product-item",
    ".product-grid .product",
    ".products .product",
    "li.product",
    ".product-miniature",
    ".product-list .item",
    ".product-layout",
    ".product-thumb",
  ];

  let items: Product[] = [];
  let foundAny = false;
  for (const sel of itemSelectors) {
    const nodes = $(sel);
    if (nodes.length === 0) continue;
    foundAny = true;
    nodes.each((_, el) => {
      const $el = $(el);
      const linkEl = $el.find("a[href]").first();
      const href = toAbsoluteUrl(linkEl.attr("href") || "");
      const id = href || extractText($el.find(".sku, [itemprop=sku]").first()) || `${url}#${items.length}`;
      const title = extractText($el.find(".product-title, .name, h2, h3, .caption h4 a").first()) || extractText(linkEl);
      const brand = extractText($el.find(".brand, .manufacturer, [itemprop=brand], .caption .manufacturer a").first());
      const priceText = extractText($el.find(".price, .product-price, [itemprop=price], .price-new, .caption .price").first());
      const price = parsePriceToKurus(priceText);
      const imgEl = $el.find("img").first();
      const img = firstAttr(imgEl, ["data-src", "data-lazy", "data-original", "srcset", "src"]) || undefined;
      const image = cleanImageUrl(img);
      if (title) {
        items.push({ id, title, brand: brand || undefined, price, image, url: href });
      }
    });
    if (items.length > 0) break;
  }

  if (items.length === 0) {
    $("script[type='application/ld+json']").each((_, el) => {
      try {
        const txt = $(el).contents().text();
        if (!txt) return;
        const data = JSON.parse(txt);
        const allNodes: any[] = Array.isArray(data) ? data : [data];
        for (const node of allNodes) {
          if (node && (node["@type"] === "Product" || (Array.isArray(node["@type"]) && node["@type"].includes("Product")))) {
            const title = node.name || node["@name"];
            const image = cleanImageUrl(Array.isArray(node.image) ? node.image[0] : node.image) || undefined;
            const offers = node.offers || {};
            const price = parsePriceToKurus(String(offers.price ?? offers["@price"] ?? node.price));
            const brand = (typeof node.brand === "string" ? node.brand : node.brand?.name) || undefined;
            const id = node.sku || node["@id"] || node.url || `${url}#${items.length}`;
            const href = toAbsoluteUrl(node.url || "");
            if (title) items.push({ id, title, brand, price, image, url: href });
          }
          if (node && (node["@type"] === "ItemList" || node.itemListElement)) {
            const els = node.itemListElement || [];
            for (const it of els) {
              const item = it.item || it;
              if (!item) continue;
              const title = item.name || item["@name"];
              const image = cleanImageUrl(Array.isArray(item.image) ? item.image[0] : item.image) || undefined;
              const offers = item.offers || {};
              const price = parsePriceToKurus(String(offers.price ?? item.price));
              const brand = (typeof item.brand === "string" ? item.brand : item.brand?.name) || undefined;
              const id = item.sku || item["@id"] || item.url || `${url}#${items.length}`;
              const href = toAbsoluteUrl(item.url || "");
              if (title) items.push({ id, title, brand, price, image, url: href });
            }
          }
        }
      } catch {}
    });
  }

  let nextUrl: string | undefined;
  const nextCand = $("a[rel=next], .pagination a.next, a.page-link[aria-label=Next]").first();
  const nHref = nextCand.attr("href");
  if (nHref) nextUrl = toAbsoluteUrl(nHref);
  if (!nextUrl) {
    $("a[href]").each((_, a) => {
      const h = $(a).attr("href") || "";
      if (/page=\d+/i.test(h)) nextUrl = toAbsoluteUrl(h);
    });
  }

  if (!foundAny) items = [];

  return { items, nextUrl };
}

async function scrapeSingleProductFromDetail(url: string): Promise<Product | undefined> {
  try {
    const { $ } = await getDocument(url);
    let found: Product | undefined;

    const pickDetailImage = () => {
      const imgSelectors = [
        "#image img",
        ".product-gallery img",
        ".thumbnails img",
        "a.thumbnail img",
        "img[itemprop=image]",
        "img[src*='/image/']",
      ];
      for (const sel of imgSelectors) {
        const el = $(sel).first();
        if (el && el.length) {
          const src = cleanImageUrl(firstAttr(el, ["data-src", "data-zoom-image", "data-large", "srcset", "src"])) || undefined;
          if (src) return toAbsoluteUrl(src);
        }
      }
      return undefined;
    };

    const pickTitle = () => extractText($("h1, .product-title, .page-title").first());
    const pickBrand = () => extractText($(".brand, .manufacturer a, [itemprop=brand]").first());
    const pickPrice = () => parsePriceToKurus(extractText($(".price, .price-new, [itemprop=price]").first()));
    const pickDesc = () => {
      const el = $("#tab-description, #description, .product-description, [itemprop=description]").first();
      const t = extractText(el);
      if (t && t.length > 10) return t;
      const meta = $("meta[name='description']").attr("content");
      return meta ? meta.trim() : undefined;
    };

    $("script[type='application/ld+json']").each((_, el) => {
      if (found) return;
      try {
        const txt = $(el).contents().text();
        if (!txt) return;
        const data = JSON.parse(txt);
        const nodes: any[] = Array.isArray(data) ? data : [data];
        for (const node of nodes) {
          if (node && (node["@type"] === "Product" || (Array.isArray(node["@type"]) && node["@type"].includes("Product")))) {
            const title = node.name || node["@name"];
            const image = (Array.isArray(node.image) ? node.image[0] : node.image) || pickDetailImage();
            const offers = node.offers || {};
            const price = parsePriceToKurus(String(offers.price ?? node.price));
            const brand = (typeof node.brand === "string" ? node.brand : node.brand?.name) || undefined;
            const id = node.sku || node["@id"] || node.url || url;
            const href = toAbsoluteUrl(node.url || url);
            const description = typeof node.description === "string" ? node.description : pickDesc();
            if (title) {
              found = { id, title, brand, price, image: image ? toAbsoluteUrl(image) : undefined, url: href, description };
              break;
            }
          }
        }
      } catch {}
    });
    if (found) return found;

    const title = pickTitle();
    const image = pickDetailImage();
    const brand = pickBrand() || undefined;
    const price = pickPrice();
    const description = pickDesc();
    if (title) return { id: url, title, brand, price, image, url, description };
    return undefined;
  } catch {
    return undefined;
  }
}

async function scrapeCategory(url: string): Promise<CategoryDump> {
  const title = extractCategoryTitle((await getDocument(url)).$, url);
  const all: Product[] = [];
  let pageUrl: string | undefined = url;
  let pageCount = 0;
  const MAX_PAGES = 120;
  while (pageUrl && pageCount < MAX_PAGES) {
    const { items, nextUrl } = await scrapeProductsFromList(pageUrl);
    if (items.length === 0) {
      const single = await scrapeSingleProductFromDetail(pageUrl);
      if (single && !all.find(x => x.id === single.id)) all.push(single);
    } else {
      for (const it of items) {
        const isValidUrl = it.url && /\/de\/parts\/huawei\//i.test(it.url);
        if (!all.find(x => x.id === it.id) && isValidUrl) all.push(it);
      }
    }
    pageUrl = nextUrl && nextUrl !== pageUrl ? nextUrl : undefined;
    pageCount++;
    await delay(200);
  }
  return { category: title, url, items: all };
}

function extractSubcategoryLinks($: cheerio.CheerioAPI): string[] {
  const links = new Set<string>();
  $("a[href]").each((_, a) => {
    const href = $(a).attr("href") || "";
    if (!href) return;
    if (/\/de\/parts\/huawei\//i.test(href)) {
      const url = normalizeCategoryUrl(href);
      if (url && url.startsWith(ORIGIN)) links.add(url);
    }
  });
  return Array.from(links);
}

async function main() {
  console.log("Scraping start:", START_URL);
  const visited = new Set<string>();
  const queue: string[] = [normalizeCategoryUrl(START_URL)];
  const results: CategoryDump[] = [];

  while (queue.length) {
    const link = queue.shift()!;
    if (!link || visited.has(link)) continue;
    visited.add(link);
    try {
      console.log("- Category:", link);
      const { $ } = await getDocument(link);
      const found = extractSubcategoryLinks($);
      for (const f of found) {
        if (f && !visited.has(f) && !queue.includes(f)) queue.push(f);
      }
      const cat = await scrapeCategory(link);
      results.push(cat);
    } catch (e) {
      console.warn("Failed category:", link, e);
    }
    await delay(250);
  }

  const outPath = "public/data/huawei-import.json";
  await writeFile(outPath, JSON.stringify(results, null, 2), "utf8");
  const total = results.reduce((sum, c) => sum + c.items.length, 0);
  console.log(`Saved ${results.length} categories, ${total} products -> ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


