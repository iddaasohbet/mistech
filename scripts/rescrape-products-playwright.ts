import { chromium, type Browser, type Page, type BrowserContext, type Cookie } from 'playwright';
import path from 'node:path';
import { readFile, writeFile, readdir } from 'node:fs/promises';

type Product = { id: string; title: string; brand?: string; price?: number; image?: string; url?: string; description?: string; tags?: string[]; attrs?: Record<string,string> };
type CategoryDump = { category: string; url: string; items: Product[] }[];

function parsePriceToCents(text?: string): number | undefined {
  if (!text) return undefined;
  const cleaned = text.replace(/[^0-9,\.]/g, '').replace(/\./g, '').replace(',', '.');
  if (!cleaned) return undefined;
  const num = Number(cleaned);
  return Number.isFinite(num) ? Math.round(num * 100) : undefined;
}

async function extractDetails(page: Page) {
  // price
  let price: number | undefined;
  // 1) JSON-LD
  try {
    const ldjson = await page.$$eval('script[type="application/ld+json"]', nodes => nodes.map(n => n.textContent || ''));
    for (const raw of ldjson) {
      try {
        const data = JSON.parse(raw as string);
        const arr = Array.isArray(data) ? data : [data];
        for (const obj of arr) {
          const offers = (obj as any)?.offers;
          const p = offers?.price || offers?.lowPrice || offers?.highPrice;
          if (p) { price = parsePriceToCents(String(p)); break; }
        }
        if (price) break;
      } catch {}
    }
  } catch {}
  if (!price) {
    const strictSelectors = ['[itemprop="price"]', '.product-price-value', '.price-new'];
    for (const sel of strictSelectors) {
      const el = await page.$(sel).catch(()=>null);
      if (!el) continue;
      const attr = await el.getAttribute('content').catch(()=>null);
      const text = (await el.textContent().catch(()=>null))?.trim() || '';
      price = parsePriceToCents(attr || text);
      if (price) break;
    }
  }

  // images
  const imgSel = ['.product-gallery img', '.swiper img', 'img[itemprop="image"]', '.product-images img'];
  const images: string[] = [];
  for (const sel of imgSel) {
    const srcs = await page.$$eval(sel, els => els.map(e => (e as HTMLImageElement).src).filter(Boolean)).catch(()=>[]);
    for (const s of srcs) if (!images.includes(s)) images.push(s);
    if (images.length >= 5) break;
  }

  // attributes/specs table
  const attrs: Record<string,string> = {};
  const rows = await page.$$eval('table tr, .specs tr, .product-attributes tr', els => els.map(tr => Array.from(tr.children).map(td => (td as HTMLElement).innerText.trim()))).catch(()=>[]);
  for (const row of rows) if (row.length >= 2) attrs[row[0]] = row.slice(1).join(' ');

  // tags/badges
  const tags = await page.$$eval('.tag, .badge, .label, .product-tags a', els => els.map(e => (e as HTMLElement).innerText.trim()).filter(Boolean)).catch(()=>[]);

  return { price, images, attrs, tags };
}

async function ensureLogin(context: BrowserContext, page: Page) {
  const email = process.env.SOURCE_EMAIL || '';
  const password = process.env.SOURCE_PASSWORD || '';
  const cookieHeader = process.env.PRICE_SOURCE_COOKIE || '';
  if (cookieHeader) {
    const cookies: Cookie[] = cookieHeader.split(';').map(part => {
      const [name, ...rest] = part.trim().split('=');
      return { name, value: rest.join('='), domain: '.euromobilecompany.de', path: '/', secure: true } as Cookie;
    }).filter(c => c.name && c.value);
    if (cookies.length) await context.addCookies(cookies);
    return;
  }
  // headful manual login fallback
  await page.goto('https://euromobilecompany.de/de/index.php?route=account/login', { waitUntil: 'domcontentloaded' }).catch(()=>{});
  console.log('[rescrape] Lütfen giriş yapın, 10 dk bekleyeceğim...');
  try {
    await page.waitForSelector('a[href*="logout"], a[href*="account"]', { timeout: 10 * 60 * 1000 });
  } catch {
    throw new Error('Login timeout');
  }
}

async function main() {
  const dataDir = path.join(process.cwd(), 'public', 'data');
  const files = (await readdir(dataDir)).filter(f => /-import\.json$/i.test(f) || f === 'apps-import.json');
  const onlyFiles = (process.env.FILES || '').split(',').map(s=>s.trim()).filter(Boolean);
  const headless = !process.env.HEADFUL;
  const browser: Browser = await chromium.launch({ headless });
  const context = await browser.newContext();
  const page = await context.newPage();
  await ensureLogin(context, page);

  // Enforce login before scraping
  await page.goto('https://euromobilecompany.de/de/index.php?route=account/account', { waitUntil: 'domcontentloaded' }).catch(()=>{});
  const logged = /logout|abmelden|account\/logout/i.test(await page.content());
  if (!logged) throw new Error('[rescrape] Login not confirmed. Aborting.');

  for (const f of (onlyFiles.length ? files.filter(x=>onlyFiles.includes(x)) : files)) {
    const fp = path.join(dataDir, f);
    const dump: CategoryDump = JSON.parse(await readFile(fp, 'utf8'));
    let changed = false;
    for (const cat of dump) {
      for (const it of cat.items) {
        if (!it.url) continue;
        try {
          await page.goto(it.url, { waitUntil: 'domcontentloaded', timeout: 35000 });
          await page.waitForLoadState('networkidle').catch(()=>{});
          const d = await extractDetails(page);
          if (d.price) it.price = d.price;
          if (d.images?.length) it.image = d.images[0];
          if (d.tags?.length) it.tags = d.tags;
          if (Object.keys(d.attrs||{}).length) it.description = JSON.stringify(d.attrs);
          changed = true;
        } catch (e) {
          // continue
        }
      }
    }
    if (changed) {
      await writeFile(fp, JSON.stringify(dump, null, 2), 'utf8');
      console.log('[rescrape] Saved:', f);
    }
  }

  await browser.close();
}

main().catch((e)=>{ console.error(e); process.exit(1); });


