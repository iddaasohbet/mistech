import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import { AuthSession } from "./utils/auth-fetch";

type Product = { id: string; title: string; brand?: string; price?: number; image?: string; url?: string; description?: string };
type CategoryDump = { category: string; url: string; items: Product[] };

function parsePriceToCents(text?: string): number | undefined {
  if (!text) return undefined;
  const cleaned = text.replace(/[^0-9,\.]/g, "").replace(/\./g, "").replace(",", ".");
  if (!cleaned) return undefined;
  const num = Number(cleaned);
  if (!Number.isFinite(num)) return undefined;
  return Math.round(num * 100);
}

function pickPriceFromHtml(html: string): number | undefined {
  const $ = cheerio.load(html);
  const sels = [
    ".price", ".product-price", "[itemprop=price]", ".price-new", ".summary .price", ".product-summary .price", ".product-info .price"
  ];
  for (const sel of sels) {
    const t = ($(sel).first().text() || "").trim();
    const p = parsePriceToCents(t);
    if (p) return p;
  }
  // JSON-LD
  let price: number | undefined;
  $("script[type='application/ld+json']").each((_, el) => {
    if (price) return;
    try {
      const data = JSON.parse($(el).contents().text() || "");
      const nodes: any[] = Array.isArray(data) ? data : [data];
      for (const node of nodes) {
        if (node && (node["@type"] === "Product" || (Array.isArray(node["@type"]) && node["@type"].includes("Product")))) {
          const offers = node.offers || {};
          const val = String(offers.price ?? offers["@price"] ?? node.price ?? "");
          const p2 = parsePriceToCents(val);
          if (p2) { price = p2; break; }
        }
      }
    } catch {}
  });
  return price;
}

async function main() {
  const email = process.env.SOURCE_EMAIL;
  const password = process.env.SOURCE_PASSWORD;
  if (!email || !password) {
    console.error("Missing SOURCE_EMAIL or SOURCE_PASSWORD. Set them and re-run.");
    console.error("On PowerShell:  $env:SOURCE_EMAIL='you@example.com'; $env:SOURCE_PASSWORD='secret'; npm run prices:fill");
    process.exit(1);
  }
  const session = new AuthSession();
  console.log("Logging in to source site...");
  const ok = await session.login(email, password);
  if (!ok) {
    console.error("Login failed. Please check credentials.");
    process.exit(1);
  }
  console.log("Login success.");

  const dataDir = path.join(process.cwd(), "public", "data");
  const allFiles = await readdir(dataDir).catch(() => [] as string[]);
  const files = allFiles.filter((f) => /-import\.json$/i.test(f) || f === "apps-import.json");
  if (files.length === 0) {
    console.log("No import files found in public/data. Nothing to do.");
    return;
  }

  let updatedCount = 0;
  let totalProducts = 0;

  for (const file of files) {
    const fp = path.join(dataDir, file);
    let text: string;
    try { text = await readFile(fp, "utf8"); } catch { continue; }
    let dump: CategoryDump[];
    try { dump = JSON.parse(text); } catch { continue; }
    let changed = false;
    for (const cat of dump) {
      for (const item of cat.items) {
        totalProducts++;
        if (typeof item.price === "number" && item.price > 0) continue;
        if (!item.url) continue;
        try {
          const res = await session.fetch(item.url, { method: "GET" });
          if (!res.ok) throw new Error(String(res.status));
          const html = await res.text();
          const price = pickPriceFromHtml(html);
          if (price && price > 0) {
            item.price = price;
            changed = true;
            updatedCount++;
            if (updatedCount % 50 === 0) console.log(`Updated ${updatedCount} prices...`);
          }
        } catch (e) {
          // best-effort, continue
        }
        await new Promise(r => setTimeout(r, 200));
      }
    }
    if (changed) {
      await writeFile(fp, JSON.stringify(dump, null, 2), "utf8");
      console.log("Saved:", file);
    } else {
      console.log("No changes:", file);
    }
  }

  console.log(`Done. Touched ${updatedCount} items out of ${totalProducts}.`);
}

main().catch((e)=>{ console.error(e); process.exit(1); });


