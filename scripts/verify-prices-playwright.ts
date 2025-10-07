import { chromium, Browser, Page } from "playwright";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

type ImportedItem = {
  id: string;
  title: string;
  brand?: string;
  price?: number; // cents
  image?: string;
  url?: string;
  description?: string;
};

type ImportedCategory = {
  category: string;
  url: string;
  items: ImportedItem[];
};

const SOURCE_URL = "https://euromobilecompany.de";
const LOGIN_URL = "https://euromobilecompany.de/de/index.php?route=account/login";
const PRICE_SELECTOR = ".product-price-value, .price-new, [itemprop=price], .price";
const COOKIE_ACCEPT_SELECTOR = "#cookie-law-info-bar #cookie_action_close_header";

function parsePriceToCents(text?: string): number | undefined {
  if (!text) return undefined;
  const cleaned = text.replace(/[^0-9,.]/g, "").replace(/\./g, "").replace(",", ".");
  if (!cleaned) return undefined;
  const num = Number(cleaned);
  return Number.isFinite(num) ? Math.round(num * 100) : undefined;
}

async function loadJson<T>(file: string): Promise<T | null> {
  try {
    const filePath = path.join(process.cwd(), "public", "data", file);
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function ensureLoggedIn(page: Page, email?: string, password?: string, cookie?: string) {
  await page.goto(SOURCE_URL, { waitUntil: "domcontentloaded" });
  try { await page.click(COOKIE_ACCEPT_SELECTOR, { timeout: 3000 }); } catch {}

  const isLoggedIn = await page.evaluate(() => {
    return Boolean(document.querySelector('a[href*="logout"], a[href*="account"]'));
  });
  if (isLoggedIn) return;

  if (cookie) {
    const cookies = cookie.split('; ').map(c => {
      const parts = c.split('=');
      const name = parts.shift();
      const value = parts.join('=');
      return { name: name!, value, domain: new URL(SOURCE_URL).hostname, path: '/' };
    });
    await page.context().addCookies(cookies);
    await page.goto(SOURCE_URL, { waitUntil: "domcontentloaded" });
    const ok = await page.evaluate(() => Boolean(document.querySelector('a[href*="logout"], a[href*="account"]')));
    if (ok) return;
  }

  if (process.env.HEADFUL === '1') {
    await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('a[href*="logout"], a[href*="account"]', { timeout: 10 * 60 * 1000 });
    return;
  }

  if (!email || !password) throw new Error("Login required but no credentials or cookie provided.");
  await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('form button[type="submit"]');
  await page.waitForURL(url => url.origin === SOURCE_URL && !url.pathname.includes('login'), { waitUntil: "domcontentloaded" });
}

async function scrapePrice(page: Page, url: string): Promise<number | undefined> {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState('networkidle');
    try { await page.click(COOKIE_ACCEPT_SELECTOR, { timeout: 2000 }); } catch {}
    const priceText = await page.textContent(PRICE_SELECTOR);
    return parsePriceToCents(priceText || undefined);
  } catch {
    return undefined;
  }
}

function percentDiff(a?: number, b?: number): number | undefined {
  if (typeof a !== 'number' || typeof b !== 'number' || a === 0) return undefined;
  return Math.abs((b - a) / a) * 100;
}

async function main() {
  const email = process.env.SOURCE_EMAIL;
  const password = process.env.SOURCE_PASSWORD;
  const cookie = process.env.PRICE_SOURCE_COOKIE;
  const headful = process.env.HEADFUL === '1';
  const limit = Number(process.env.LIMIT || process.argv[2] || 0); // 0 => no limit
  const tolerancePct = Number(process.env.TOLERANCE || 1); // 1%

  const files = [
    "apps-import.json", "samsung-import.json", "oppo-import.json", "xiaomi-import.json",
    "huawei-import.json", "oneplus-import.json", "realme-import.json", "google-import.json",
    "motorola-import.json", "nokia-import.json", "vivo-import.json", "sony-import.json",
    "lg-import.json", "microsoft-import.json", "lenovo-import.json", "asus-import.json",
    "wiko-import.json", "zte-import.json", "nintendo-import.json",
    "accessories-screen-protectors.json", "accessories-cases-and-covers.json",
    "accessories-holders.json", "accessories-cables.json", "accessories-chargers.json",
    "accessories-audio.json", "accessories-data-storage.json"
  ];

  const browser: Browser = await chromium.launch({ headless: !headful });
  const context = await browser.newContext();
  const page: Page = await context.newPage();
  try {
    await ensureLoggedIn(page, email, password, cookie);

    const mismatches: string[] = [
      ["file","category","title","url","stored_cents","scraped_cents","diff_pct"].join(",")
    ];

    let checked = 0;
    let okCount = 0;
    for (const file of files) {
      const categories = (await loadJson<ImportedCategory[]>(file)) || [];
      for (const category of categories) {
        for (const item of category.items) {
          if (limit && checked >= limit) break;
          if (!item.url) continue;
          checked++;
          const scraped = await scrapePrice(page, item.url);
          if (typeof scraped === 'number') {
            const diff = percentDiff(item.price, scraped) ?? Infinity;
            if (!(diff <= tolerancePct)) {
              mismatches.push([
                file,
                JSON.stringify(category.category),
                JSON.stringify(item.title || ""),
                JSON.stringify(item.url),
                String(item.price ?? ""),
                String(scraped),
                diff === Infinity ? "n/a" : diff.toFixed(2)
              ].join(","));
            } else {
              okCount++;
            }
          } else {
            mismatches.push([
              file,
              JSON.stringify(category.category),
              JSON.stringify(item.title || ""),
              JSON.stringify(item.url),
              String(item.price ?? ""),
              "",
              "no-price"
            ].join(","));
          }
          await delay(150);
        }
      }
      if (limit && checked >= limit) break;
    }

    const outDir = path.join(process.cwd(), "scripts", "out");
    await mkdir(outDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const csvPath = path.join(outDir, `price-mismatches-${stamp}.csv`);
    await writeFile(csvPath, mismatches.join("\n"), "utf8");
    console.log(`[verify] Checked: ${checked}, OK within ±${tolerancePct}%: ${okCount}, Mismatches saved to: ${csvPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });


