import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

function shortHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) hash = (hash * 33) ^ input.charCodeAt(i);
  return (hash >>> 0).toString(36);
}

async function loadCache(locale: string): Promise<Record<string, string>> {
  try {
    const fp = path.join(process.cwd(), "public", "data", "translations", `${locale}.json`);
    const raw = await readFile(fp, "utf8");
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

async function saveCache(locale: string, cache: Record<string, string>) {
  const dir = path.join(process.cwd(), "public", "data", "translations");
  try { await mkdir(dir, { recursive: true }); } catch {}
  const fp = path.join(dir, `${locale}.json`);
  await writeFile(fp, JSON.stringify(cache, null, 2), "utf8");
}

const ENDPOINTS = [
  "https://libretranslate.de/translate",
  "https://translate.astian.org/translate",
];

function mapLocale(locale: string): string {
  const l = locale.toLowerCase();
  if (l.startsWith("tr")) return "tr";
  if (l.startsWith("de")) return "de";
  return "en";
}

export async function translateText(text: string, targetLocale: string): Promise<string> {
  try {
    const target = mapLocale(targetLocale);
    if (!text || text.length < 2) return text;
    const key = shortHash(`${target}|${text}`);
    const cache = await loadCache(target);
    if (cache[key]) return cache[key];

    const body = { q: text, source: "auto", target, format: "text" } as any;
    for (const url of ENDPOINTS) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          // @ts-ignore
          cache: "no-store",
        } as any);
        if (!res.ok) continue;
        const data = await res.json().catch(() => null) as any;
        const translated = (data && (data.translatedText || data.translation)) as string | undefined;
        if (translated && translated.trim()) {
          cache[key] = translated.trim();
          await saveCache(target, cache);
          return cache[key];
        }
      } catch {}
    }
    return text;
  } catch {
    return text;
  }
}

export async function translateMaybe(text: string | undefined, targetLocale: string): Promise<string | undefined> {
  if (typeof text !== "string") return text;
  return await translateText(text, targetLocale);
}


