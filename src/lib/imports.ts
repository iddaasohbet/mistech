import { readFile } from "node:fs/promises";
import path from "node:path";

export type ImportedItem = {
  id: string;
  title: string;
  brand?: string;
  price?: number;
  image?: string;
  url?: string;
  description?: string;
};

export type ImportedCategory = {
  category: string;
  url: string;
  items: ImportedItem[];
};

export type ImportedSource = "app" | "samsung" | "oppo" | "xiaomi" | "huawei" | "oneplus" | "realme" | "google" | "motorola" | "nokia" | "vivo" | "sony" | "lg" | "microsoft" | "lenovo" | "asus" | "wiko" | "zte" | "nintendo" | "accessories";

export function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

export function shortHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) hash = (hash * 33) ^ input.charCodeAt(i);
  const v = (hash >>> 0).toString(36);
  return v.slice(0, 6);
}

export function buildImportedSlug(item: ImportedItem): string {
  const base = slugify(item.title || "urun");
  const h = shortHash(item.id || item.url || base);
  return `${base}-${h}`;
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

export async function loadAllImports(): Promise<{ source: ImportedSource; categories: ImportedCategory[] }[]> {
  const apps = (await loadJson<ImportedCategory[]>("apps-import.json")) || [];
  const sams = (await loadJson<ImportedCategory[]>("samsung-import.json")) || [];
  const oppo = (await loadJson<ImportedCategory[]>("oppo-import.json")) || [];
  const xiaomi = (await loadJson<ImportedCategory[]>("xiaomi-import.json")) || [];
  const huawei = (await loadJson<ImportedCategory[]>("huawei-import.json")) || [];
  const oneplus = (await loadJson<ImportedCategory[]>("oneplus-import.json")) || [];
  const realme = (await loadJson<ImportedCategory[]>("realme-import.json")) || [];
  const google = (await loadJson<ImportedCategory[]>("google-import.json")) || [];
  const motorola = (await loadJson<ImportedCategory[]>("motorola-import.json")) || [];
  const nokia = (await loadJson<ImportedCategory[]>("nokia-import.json")) || [];
  const vivo = (await loadJson<ImportedCategory[]>("vivo-import.json")) || [];
  const sony = (await loadJson<ImportedCategory[]>("sony-import.json")) || [];
  const lg = (await loadJson<ImportedCategory[]>("lg-import.json")) || [];
  const microsoft = (await loadJson<ImportedCategory[]>("microsoft-import.json")) || [];
  const lenovo = (await loadJson<ImportedCategory[]>("lenovo-import.json")) || [];
  const asus = (await loadJson<ImportedCategory[]>("asus-import.json")) || [];
  const wiko = (await loadJson<ImportedCategory[]>("wiko-import.json")) || [];
  const zte = (await loadJson<ImportedCategory[]>("zte-import.json")) || [];
  const nintendo = (await loadJson<ImportedCategory[]>("nintendo-import.json")) || [];
  const accessoriesScreens = (await loadJson<ImportedCategory[]>("accessories-screen-protectors.json")) || [];
  const accessoriesCovers = (await loadJson<ImportedCategory[]>("accessories-cases-and-covers.json")) || [];
  const accessoriesHolders = (await loadJson<ImportedCategory[]>("accessories-holders.json")) || [];
  const accessoriesCables = (await loadJson<ImportedCategory[]>("accessories-cables.json")) || [];
  const accessoriesChargers = (await loadJson<ImportedCategory[]>("accessories-chargers.json")) || [];
  const accessoriesAudio = (await loadJson<ImportedCategory[]>("accessories-audio.json")) || [];
  const accessoriesData = (await loadJson<ImportedCategory[]>("accessories-data-storage.json")) || [];
  return [
    { source: "app", categories: apps },
    { source: "samsung", categories: sams },
    { source: "oppo", categories: oppo },
    { source: "xiaomi", categories: xiaomi },
    { source: "huawei", categories: huawei },
    { source: "oneplus", categories: oneplus },
    { source: "realme", categories: realme },
    { source: "google", categories: google },
    { source: "motorola", categories: motorola },
    { source: "nokia", categories: nokia },
    { source: "vivo", categories: vivo },
    { source: "sony", categories: sony },
    { source: "lg", categories: lg },
    { source: "microsoft", categories: microsoft },
    { source: "lenovo", categories: lenovo },
    { source: "asus", categories: asus },
    { source: "wiko", categories: wiko },
    { source: "zte", categories: zte },
    { source: "nintendo", categories: nintendo },
    { source: "accessories", categories: [...accessoriesScreens, ...accessoriesCovers, ...accessoriesHolders, ...accessoriesCables, ...accessoriesChargers, ...accessoriesAudio, ...accessoriesData] },
  ];
}

export async function findImportedProductBySlug(slug: string): Promise<null | { source: ImportedSource; product: ImportedItem }>
{
  const all = await loadAllImports();
  for (const { source, categories } of all) {
    for (const c of categories) {
      for (const it of c.items || []) {
        if (buildImportedSlug(it) === slug) return { source, product: it };
      }
    }
  }
  return null;
}

export async function getSimilarImportedProducts(ref: ImportedItem, source: ImportedSource, limit = 8): Promise<ImportedItem[]> {
  const all = await loadAllImports();
  const bucket = all.find((x) => x.source === source)?.categories || [];
  const list: ImportedItem[] = [];
  const targetBrand = (ref.brand || "").toLowerCase();
  const firstToken = slugify(ref.title).split("-")[0];
  for (const c of bucket) {
    for (const it of c.items || []) {
      if (it.id === ref.id) continue;
      const sameBrand = targetBrand && (it.brand || "").toLowerCase() === targetBrand;
      const sharesToken = slugify(it.title).includes(firstToken);
      if (sameBrand || sharesToken) {
        if (!list.find((x) => x.id === it.id)) list.push(it);
        if (list.length >= limit) return list;
      }
    }
  }
  return list;
}


