import { writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import * as cheerio from "cheerio";
import { fetch } from "undici";

type Product = {
  id: string;
  title: string;
  brand?: string;
  price?: number; // in kuruş
  image?: string;
  url?: string;
};

type CategoryDump = {
  category: string;
  url: string;
  items: Product[];
};

const START_URL = "https://euromobilecompany.de/de/parts/for-apple/for-iphone";
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
  const num = Number(cleaned);
  if (Number.isFinite(num)) return Math.round(num * 100);
  return undefined;
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

function extractSubcategoryLinks($: cheerio.CheerioAPI): string[] {
  const links = new Set<string>();
  $("a[href]").each((_, a) => {
    const href = $(a).attr("href") || "";
    if (!href) return;
    if (/for-iphone\/?/i.test(href) && href.includes("/de/parts/")) {
      const url = toAbsoluteUrl(href.split("#")[0]);
      if (url && url.startsWith(ORIGIN)) links.add(url);
    }
  });
  return Array.from(links);
}

function firstAttr($el: cheerio.Cheerio<any>, attrs: string[]): string | undefined {
  for (const a of attrs) {
    const v = $el.attr(a);
    if (v) return v;
  }
  return undefined;
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
      const title = extractText($el.find(".product-title, .name, h2, h3").first()) || extractText(linkEl);
      const brand = extractText($el.find(".brand, .manufacturer, [itemprop=brand]").first());
      const priceText = extractText($el.find(".price, .product-price, [itemprop=price]").first());
      const price = parsePriceToKurus(priceText);
      const imgEl = $el.find("img").first();
      const img = firstAttr(imgEl, ["data-src", "data-lazy", "srcset", "src"]) || undefined;
      const image = img?.split(" ")[0];
      if (title) {
        items.push({ id, title, brand: brand || undefined, price, image, url: href });
      }
    });
    if (items.length > 0) break;
  }

  // Fallback: Try to parse JSON-LD for Product data on the page (common on many shops)
  if (items.length === 0) {
    $("script[type='application/ld+json']").each((_, el) => {
      try {
        const txt = $(el).contents().text();
        if (!txt) return;
        const data = JSON.parse(txt);
        const allNodes: any[] = Array.isArray(data) ? data : [data];
        for (const node of allNodes) {
          // Case 1: Direct Product object
          if (node && (node["@type"] === "Product" || (Array.isArray(node["@type"]) && node["@type"].includes("Product")))) {
            const title = node.name || node["@name"];
            const image = (Array.isArray(node.image) ? node.image[0] : node.image) || undefined;
            const offers = node.offers || {};
            const price = parsePriceToKurus(String(offers.price ?? offers["@price"] ?? node.price));
            const brand = (typeof node.brand === "string" ? node.brand : node.brand?.name) || undefined;
            const id = node.sku || node["@id"] || node.url || `${url}#${items.length}`;
            const href = toAbsoluteUrl(node.url || "");
            if (title) items.push({ id, title, brand, price, image, url: href });
          }
          // Case 2: ItemList with product items
          if (node && (node["@type"] === "ItemList" || node.itemListElement)) {
            const els = node.itemListElement || [];
            for (const it of els) {
              const item = it.item || it;
              if (!item) continue;
              const title = item.name || item["@name"]; 
              const image = (Array.isArray(item.image) ? item.image[0] : item.image) || undefined;
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

  // Try discover next page
  let nextUrl: string | undefined;
  const nextCand = $("a[rel=next], .pagination a.next, a.page-link[aria-label=Next]").first();
  const nHref = nextCand.attr("href");
  if (nHref) nextUrl = toAbsoluteUrl(nHref);

  // Fallback: find any page link with "page" param greater than 1
  if (!nextUrl) {
    $("a[href]").each((_, a) => {
      const h = $(a).attr("href") || "";
      if (/page=\d+/i.test(h)) nextUrl = toAbsoluteUrl(h);
    });
  }

  // If no items found at all, page might be a pure category hub; return empty
  if (!foundAny) items = [];

  return { items, nextUrl };
}

async function scrapeSingleProductFromDetail(url: string): Promise<Product | undefined> {
  try {
    const { $ } = await getDocument(url);
    let found: Product | undefined;
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
            const image = (Array.isArray(node.image) ? node.image[0] : node.image) || undefined;
            const offers = node.offers || {};
            const price = parsePriceToKurus(String(offers.price ?? node.price));
            const brand = (typeof node.brand === "string" ? node.brand : node.brand?.name) || undefined;
            const id = node.sku || node["@id"] || node.url || url;
            const href = toAbsoluteUrl(node.url || url);
            if (title) {
              found = { id, title, brand, price, image, url: href };
              break;
            }
          }
        }
      } catch {}
    });
    return found;
  } catch {
    return undefined;
  }
}

async function scrapeCategory(url: string): Promise<CategoryDump> {
  const title = extractCategoryTitle((await getDocument(url)).$, url);
  const all: Product[] = [];
  let pageUrl: string | undefined = url;
  let pageCount = 0;
  const MAX_PAGES = 10;
  while (pageUrl && pageCount < MAX_PAGES) {
    const { items, nextUrl } = await scrapeProductsFromList(pageUrl);
    if (items.length === 0) {
      // Maybe this URL is a single product detail page
      const single = await scrapeSingleProductFromDetail(pageUrl);
      if (single && !all.find(x => x.id === single.id)) {
        all.push(single);
      }
    } else {
      for (const it of items) {
        if (!all.find(x => x.id === it.id)) all.push(it);
      }
    }
    pageUrl = nextUrl && nextUrl !== pageUrl ? nextUrl : undefined;
    pageCount++;
    await delay(250);
  }
  return { category: title, url, items: all };
}

async function main() {
  console.log("Scraping start:", START_URL);
  const { $ } = await getDocument(START_URL);
  const links = extractSubcategoryLinks($)
    .filter(u => u.includes("for-iphone"))
    .filter((u, i, arr) => arr.indexOf(u) === i);

  // Always include the start URL itself as a category
  if (!links.includes(START_URL)) links.unshift(START_URL);

  const results: CategoryDump[] = [];
  for (const link of links) {
    try {
      console.log("- Category:", link);
      const cat = await scrapeCategory(link);
      results.push(cat);
    } catch (e) {
      console.warn("Failed category:", link, e);
    }
    await delay(300);
  }

  const outPath = "public/data/apps-import.json";
  await writeFile(outPath, JSON.stringify(results, null, 2), "utf8");
  const total = results.reduce((sum, c) => sum + c.items.length, 0);
  console.log(`Saved ${results.length} categories, ${total} products -> ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


