import { PrismaClient } from "../src/generated/prisma";
import fs from "node:fs";
import path from "node:path";

type CategoryNode = {
  id: string;
  slug: string;
  name: string;
  children: CategoryNode[];
};

async function main() {
  const prisma = new PrismaClient();
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, slug: true, name: true, parentId: true },
      orderBy: [{ name: "asc" }],
    });

    const byId = new Map<string, CategoryNode>();
    for (const c of categories) {
      byId.set(c.id, { id: c.id, slug: c.slug, name: c.name, children: [] });
    }

    const roots: CategoryNode[] = [];
    for (const c of categories) {
      const node = byId.get(c.id)!;
      if (c.parentId && byId.has(c.parentId)) {
        byId.get(c.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    const outDir = path.join(process.cwd(), "php-theme", "data");
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, "categories.json");
    fs.writeFileSync(outFile, JSON.stringify(roots, null, 2), { encoding: "utf8" });
    console.log(`Exported ${categories.length} categories → ${path.relative(process.cwd(), outFile)}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


