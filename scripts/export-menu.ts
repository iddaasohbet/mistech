import fs from "node:fs";
import path from "node:path";
import { loadAllImports, ImportedCategory } from "../src/lib/imports";

type MenuNode = {
  slug: string;
  name: string;
  children?: MenuNode[];
};

const BRAND_NAMES: Record<string, string> = {
  app: "Apple",
  samsung: "Samsung",
  oppo: "OPPO",
  xiaomi: "Xiaomi",
  huawei: "Huawei",
  oneplus: "OnePlus",
  realme: "Realme",
  google: "Google",
  motorola: "Motorola",
  nokia: "Nokia",
  vivo: "Vivo",
  sony: "Sony",
  lg: "LG",
  microsoft: "Microsoft",
  lenovo: "Lenovo",
  asus: "ASUS",
  wiko: "Wiko",
  zte: "ZTE",
  nintendo: "Nintendo",
};

function labelFromUrl(u: string): string {
  try {
    const url = new URL(u);
    const parts = url.pathname.split("/").filter(Boolean);
    const last = parts.pop() || "";
    const label = decodeURIComponent(last).replace(/[-_]/g, " ").trim();
    if (!label || label.toLowerCase() === "parts") {
      const prev = parts.pop() || label;
      return decodeURIComponent(prev).replace(/[-_]/g, " ").trim();
    }
    return label;
  } catch {
    return "";
  }
}

function buildGroups(cats: ImportedCategory[]) {
  const groups = new Map<string, { label: string; count: number }>();
  for (const c of cats) {
    if (!c.items || c.items.length === 0) continue;
    const label = labelFromUrl(c.url);
    if (!label) continue;
    const key = label.toLowerCase();
    const prev = groups.get(key);
    groups.set(key, { label, count: (prev?.count || 0) + c.items.length });
  }
  return Array.from(groups.values()).sort((a, b) => b.count - a.count);
}

async function main() {
  const all = await loadAllImports();

  const telefonlarChildren: MenuNode[] = [];
  for (const { source, categories } of all) {
    if (source === "accessories") continue;
    if (source === "app") continue; // Apple apps import is separate; keep as brand via 'app'
    const brand = String(source);
    const brandName = BRAND_NAMES[brand] || brand.charAt(0).toUpperCase() + brand.slice(1);
    const groups = buildGroups(categories);
    const models: MenuNode[] = groups.map((g) => ({
      slug: `${brand}?model=${encodeURIComponent(g.label)}`,
      name: g.label,
    }));
    telefonlarChildren.push({ slug: brand, name: brandName, children: models });
  }

  telefonlarChildren.sort((a, b) => a.name.localeCompare(b.name, "tr"));

  const accessoriesChildren: MenuNode[] = [
    { slug: "accessories?type=screen-protectors", name: "Ekran Koruyucular" },
    { slug: "accessories?type=cases-and-covers", name: "Kılıf & Kapaklar" },
    { slug: "accessories?type=holders", name: "Tutucular" },
    { slug: "accessories?type=cables", name: "Kablolar" },
    { slug: "accessories?type=chargers", name: "Şarj Aletleri" },
    { slug: "accessories?type=audio", name: "Ses Ürünleri" },
    { slug: "accessories?type=data-storage", name: "Depolama" },
  ];

  const tree: MenuNode[] = [
    { slug: "telefonlar", name: "Telefonlar", children: telefonlarChildren },
    { slug: "accessories", name: "Aksesuarlar", children: accessoriesChildren },
  ];

  const outDir = path.join(process.cwd(), "php-theme", "data");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "categories.json"), JSON.stringify(tree, null, 2), "utf8");
  console.log(`Exported menu with brands and models → ${path.relative(process.cwd(), path.join(outDir, "categories.json"))}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


