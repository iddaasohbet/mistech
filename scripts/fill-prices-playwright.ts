import { chromium, type Browser, type Page, type BrowserContext, type Cookie } from 'playwright';
import path from 'node:path';
import { readFile, writeFile, readdir } from 'node:fs/promises';

type Product = { id: string; title: string; brand?: string; price?: number; image?: string; url?: string; description?: string };
type CategoryDump = { category: string; url: string; items: Product[] }[];

function parsePriceToCents(text?: string): number | undefined {
  if (!text) return undefined;
  const cleaned = text.replace(/[^0-9,\.]/g, '').replace(/\./g, '').replace(',', '.');
  if (!cleaned) return undefined;
  const num = Number(cleaned);
  return Number.isFinite(num) ? Math.round(num * 100) : undefined;
}

async function dismissCookies(page: Page) {
  const buttons = [
    'text=/accept all/i',
    'text=/accept/i',
    'text=/kabul et/i',
    'text=/akzeptieren/i',
    'text=/alles akzeptieren/i',
    'text=/tamam/i',
    'text=/ok/i',
  ];
  for (const sel of buttons) {
    const b = await page.$(sel).catch(()=>null);
    if (b) { await b.click({ timeout: 500 }).catch(()=>{}); break; }
  }
}

async function ensureLoggedIn(page: Page, email: string, password: string) {
  const candidates = [
    '/de/index.php?route=account/login',
    '/index.php?route=account/login',
    '/de/account/login',
    '/account/login',
    '/de/authentication',
    '/authentication',
  ];
  for (const path of candidates) {
    try {
      await page.goto(`https://euromobilecompany.de${path}`, { waitUntil: 'domcontentloaded' });
      await dismissCookies(page);
      const hasForm = await page.$('form');
      if (!hasForm) continue;
      const emailSel = 'input[type=email], input[name*="mail" i], #input-email, input[name=email]';
      const passSel = 'input[type=password], input[name*="pass" i], #input-password, input[name=password]';
      if (!(await page.$(emailSel)) || !(await page.$(passSel))) continue;
      await page.fill(emailSel, email, { timeout: 5000 }).catch(()=>{});
      await page.fill(passSel, password, { timeout: 5000 }).catch(()=>{});
      // submit
      const btn = await page.$('button[type=submit], input[type=submit], button:has-text("Login"), button:has-text("Anmelden"), button:has-text("Giriş"), button:has-text("Sign in")');
      if (btn) await btn.click().catch(()=>{}); else await page.keyboard.press('Enter').catch(()=>{});
      await page.waitForTimeout(1500);
      // check logged in
      await page.goto('https://euromobilecompany.de/de/index.php?route=account/account', { waitUntil: 'domcontentloaded' });
      const html = await page.content();
      if (/logout|abmelden|account\/logout/i.test(html)) return;
    } catch {}
  }
  throw new Error('Login failed');
}

async function extractPrice(page: Page): Promise<number | undefined> {
  // 1) Try JSON-LD structured data first (most reliable)
  try {
    const ldjson = await page.$$eval('script[type="application/ld+json"]', nodes => nodes.map(n => n.textContent || ''));
    for (const raw of ldjson) {
      try {
        const data = JSON.parse(raw as string);
        const arr = Array.isArray(data) ? data : [data];
        for (const obj of arr) {
          const offers = (obj && (obj.offers || (obj['@graph'] || []).find((x: any)=>x.offers)?.offers)) as any;
          const price = offers?.price || offers?.lowPrice || offers?.highPrice;
          if (price) {
            const p = typeof price === 'string' ? price : String(price);
            const cents = p ? (p.includes('.') || p.includes(',') ? undefined : Number.isFinite(Number(p)) ? Math.round(Number(p) * 100) : undefined) : undefined;
            const parsed = cents ?? (typeof price === 'string' ? undefined : undefined);
            const fromText = typeof price === 'string' ? price : String(price);
            const fallback = fromText ? fromText.replace(/[^0-9,\.]/g, '') : '';
            const final = parsePriceToCents(fallback);
            if (final && final > 0) return final;
          }
        }
      } catch {}
    }
  } catch {}

  // 2) Prefer strict, product-scoped selectors
  const strictSelectors = [
    '[itemprop="price"]',
    '.product-price-value',
    '.price-new',
    '.product-price .price',
    '.product-summary .price',
    '.summary .price'
  ];
  const strictValues: number[] = [];
  for (const sel of strictSelectors) {
    const el = await page.$(sel).catch(() => null);
    if (!el) continue;
    const attr = await el.getAttribute('content').catch(() => null);
    const text = (await el.textContent().catch(() => null))?.trim() || '';
    const p = parsePriceToCents(attr || text);
    if (p && p > 0) strictValues.push(p);
  }
  if (strictValues.length) {
    // pick the minimum plausible price (avoid totals/sets)
    return Math.min(...strictValues);
  }

  // 3) Fallback: scan common price-like elements and pick minimum
  const candidates = await page.$$('[class*="price" i], [id*="price" i], .price');
  const values: number[] = [];
  for (const el of candidates) {
    const t = (await el.textContent().catch(() => null))?.trim() || '';
    const p = parsePriceToCents(t);
    if (p && p > 0) values.push(p);
  }
  if (values.length) return Math.min(...values);

  // 4) Last resort: regex over HTML
  const html = await page.content();
  const m = html.match(/(?:€|eur|price)[^0-9]{0,6}([0-9.,]+)/i);
  if (m) return parsePriceToCents(m[1]);
  return undefined;
}

async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    await page.goto('https://euromobilecompany.de/de/index.php?route=account/account', { waitUntil: 'domcontentloaded' });
    const html = await page.content();
    return /logout|abmelden|account\/logout/i.test(html);
  } catch {
    return false;
  }
}

async function waitForManualLogin(page: Page, timeoutMs = 5 * 60 * 1000) {
  const start = Date.now();
  console.log('[prices] Lütfen açılan pencerede giriş yapın. Giriş algılanınca otomatik devam edeceğim.');
  await page.goto('https://euromobilecompany.de/de/', { waitUntil: 'domcontentloaded' }).catch(()=>{});
  while (Date.now() - start < timeoutMs) {
    if (await isLoggedIn(page)) return;
    await page.waitForTimeout(1500);
  }
  throw new Error('Manual login timeout');
}

async function main() {
  const email = process.env.SOURCE_EMAIL;
  const password = process.env.SOURCE_PASSWORD;
  const cookieHeader = process.env.PRICE_SOURCE_COOKIE; // optional: use logged-in browser cookies
  const forceRefresh = process.env.FORCE_REFRESH === '1' || process.env.REFRESH === '1';
  const onlyFiles = (process.env.FILES || '').split(',').map(s=>s.trim()).filter(Boolean);
  if (!email || !password) {
    console.warn('Warning: SOURCE_EMAIL or SOURCE_PASSWORD missing. Will try cookie-based auth if PRICE_SOURCE_COOKIE is provided.');
  }

  const dataDir = path.join(process.cwd(), 'public', 'data');
  let files = (await readdir(dataDir)).filter(f => /-import\.json$/i.test(f) || f === 'apps-import.json');
  if (onlyFiles.length) {
    files = files.filter(f => onlyFiles.includes(f));
    console.log('[prices] Processing only selected files:', files.join(', '));
  }
  if (files.length === 0) {
    console.log('No import files found.');
    return;
  }

  const headless = !process.env.HEADFUL;
  const browser: Browser = await chromium.launch({ headless });
  let context: BrowserContext = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
  });

  // If cookie header provided, inject cookies to context (domain: .euromobilecompany.de)
  if (cookieHeader) {
    const cookies: Cookie[] = [];
    for (const part of cookieHeader.split(';')) {
      const seg = part.trim();
      if (!seg) continue;
      const eq = seg.indexOf('=');
      if (eq <= 0) continue;
      const name = seg.slice(0, eq).trim();
      const value = seg.slice(eq + 1).trim();
      if (!name || !value) continue;
      cookies.push({ name, value, domain: '.euromobilecompany.de', path: '/', httpOnly: false, secure: true });
    }
    if (cookies.length) await context.addCookies(cookies);
  }

  const page = await context.newPage();
  if (!cookieHeader) {
    // Try scripted login first
    try {
      await ensureLoggedIn(page, email || '', password || '');
    } catch {
      // Headful ise kullanıcıdan giriş yapmasını iste
      if (!headless) {
        await waitForManualLogin(page, 10 * 60 * 1000);
      } else {
        throw new Error('Login failed (headless). Provide PRICE_SOURCE_COOKIE or run headful and login manually.');
      }
    }
  }

  // Enforce: do not continue unless logged in
  if (!(await isLoggedIn(page))) {
    throw new Error('[prices] Login not confirmed. Aborting scrape to avoid wrong prices.');
  } else {
    console.log('[prices] Logged-in confirmed. Starting scrape...');
  }

  let touched = 0;
  let total = 0;

  for (const f of files) {
    const fp = path.join(dataDir, f);
    const txt = await readFile(fp, 'utf8');
    const dump: CategoryDump = JSON.parse(txt);
    let changed = false;
    for (const cat of dump) {
      for (const it of cat.items) {
        total++;
        if (!forceRefresh && typeof it.price === 'number' && it.price > 0) continue;
        if (!it.url) continue;
        try {
          await page.goto(it.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
          // give client-side price time to render
          await page.waitForTimeout(800);
          const price = await extractPrice(page);
          if (price && price > 0) {
            it.price = price;
            changed = true;
            touched++;
            if (touched % 50 === 0) console.log(`Updated ${touched} prices...`);
          }
        } catch {}
      }
    }
    if (changed) {
      await writeFile(fp, JSON.stringify(dump, null, 2), 'utf8');
      console.log('Saved:', f);
    } else {
      console.log('No changes:', f);
    }
  }

  console.log(`Done. Updated ${touched} items out of ${total}.`);
  await browser.close();
}

main().catch(async (e) => { console.error(e); process.exit(1); });


