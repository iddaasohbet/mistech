import { fetch } from "undici";

export type BasicItem = { id: string; title: string; url?: string; price?: number };

const PRICE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const priceCache = new Map<string, { price: number; ts: number }>();

function parsePriceToKurus(text?: string) {
  if (!text) return undefined;
  const cleaned = text.replace(/[^0-9,.]/g, "").replace(/\./g, "").replace(",", ".");
  if (!cleaned) return undefined;
  const num = Number(cleaned);
  return Number.isFinite(num) ? Math.round(num * 100) : undefined;
}

async function fetchPriceFromUrl(url: string): Promise<number | undefined> {
  // Cache check
  const cached = priceCache.get(url);
  if (cached && Date.now() - cached.ts < PRICE_TTL_MS) return cached.price;

  try {
    const cookie = process.env.PRICE_SOURCE_COOKIE || process.env.EMC_PRICE_COOKIE;
    const res = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
        accept: "text/html,application/xhtml+xml",
        ...(cookie ? { cookie } : {})
      }
    });
    if (!res.ok) return undefined;
    const html = await res.text();
    // Try JSON-LD
    const ld = Array.from(html.matchAll(/<script[^>]*type=['"]application\/ld\+json['"][^>]*>([\s\S]*?)<\/script>/gi)).map(m => m[1]);
    for (const json of ld) {
      try {
        const data = JSON.parse(json);
        const nodes = Array.isArray(data) ? data : [data];
        for (const node of nodes) {
          const t = node && (node["@type"] || node["@context"]);
          if (t && JSON.stringify(t).toLowerCase().includes("product")) {
            const offers = node.offers || {};
            const p = parsePriceToKurus(String(offers.price ?? node.price));
            if (typeof p === "number") {
              priceCache.set(url, { price: p, ts: Date.now() });
              return p;
            }
          }
        }
      } catch {}
    }
    // Fallback: generic price regex (e.g. € 12,34)
    const m = html.match(/(?:€|eur|price)[^0-9]{0,6}([0-9.,]+)/i);
    if (m) {
      const p = parsePriceToKurus(m[1]);
      if (typeof p === "number") priceCache.set(url, { price: p, ts: Date.now() });
      return p;
    }
  } catch {}
  return undefined;
}

export async function enrichPricesForItems<T extends BasicItem>(items: T[]): Promise<T[]> {
  const out: T[] = [];
  for (const it of items) {
    if (typeof it.price === "number" || !it.url) { out.push(it); continue; }
    const price = await fetchPriceFromUrl(it.url);
    out.push({ ...it, price: typeof price === "number" ? price : it.price });
  }
  return out;
}

export async function enrichPriceForUrl(url?: string, current?: number): Promise<number | undefined> {
  if (typeof current === "number" && Number.isFinite(current)) return current;
  if (!url) return undefined;
  return await fetchPriceFromUrl(url);
}


