import fs from "node:fs";
import path from "node:path";

type CategoryNode = {
  slug: string;
  name: string;
  children?: CategoryNode[];
};

function toTitle(input: string): string {
  const special: Record<string, string> = {
    lg: "LG",
    zte: "ZTE",
    app: "Uygulamalar",
    accessories: "Aksesuarlar",
    telefonlar: "Telefonlar",
  };
  if (special[input]) return special[input];
  return input
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function main() {
  const kategoriDir = path.join(process.cwd(), "src", "app", "[locale]", "kategori");
  const entries = fs.readdirSync(kategoriDir, { withFileTypes: true });
  const dirSlugs = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((s) => s !== "_" && s !== "." && s !== "..");

  const brands = dirSlugs.filter((s) => !["telefonlar", "accessories", "app"].includes(s));

  const accessoriesDataDir = path.join(process.cwd(), "public", "data");
  const accessoriesChildren: CategoryNode[] = [];
  for (const file of fs.readdirSync(accessoriesDataDir)) {
    if (!file.startsWith("accessories-") || !file.endsWith(".json")) continue;
    const slug = file.replace(".json", "").replace(/^accessories-/, "");
    accessoriesChildren.push({ slug: `accessories-${slug}`, name: toTitle(slug) });
  }
  accessoriesChildren.sort((a, b) => a.name.localeCompare(b.name, "tr"));

  const tree: CategoryNode[] = [];

  if (dirSlugs.includes("telefonlar")) {
    tree.push({ slug: "telefonlar", name: toTitle("telefonlar") });
  }
  if (brands.length > 0) {
    tree.push({
      slug: "markalar",
      name: "Markalar",
      children: brands
        .map((slug) => ({ slug, name: toTitle(slug) }))
        .sort((a, b) => a.name.localeCompare(b.name, "tr")),
    });
  }
  if (dirSlugs.includes("accessories")) {
    tree.push({ slug: "accessories", name: toTitle("accessories"), children: accessoriesChildren });
  }
  if (dirSlugs.includes("app")) {
    tree.push({ slug: "app", name: toTitle("app") });
  }

  const outDir = path.join(process.cwd(), "php-theme", "data");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "categories.json"), JSON.stringify(tree, null, 2), "utf8");
  console.log(`Exported full category tree → ${path.relative(process.cwd(), path.join(outDir, "categories.json"))}`);
}

main();


