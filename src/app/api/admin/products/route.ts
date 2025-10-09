export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { loadAllImports, buildImportedSlug } from "@/lib/imports";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search");
    const brand = searchParams.get("brand");

    // Load all imported products first
    const allImports = await loadAllImports();
    const importedProducts: any[] = [];
    for (const { source, categories } of allImports) {
      for (const category of categories) {
        for (const item of category.items || []) {
          importedProducts.push({
            id: String(item.id || item.url || item.title),
            title: item.title,
            brand: item.brand || source,
            price: item.price || 0,
            slug: buildImportedSlug(item),
            images: item.image ? [item.image] : [],
            category: { name: category.category },
            source,
            description: item.description || "",
          });
        }
      }
    }

    // Fetch DB products (overrides and created ones) – fail soft if DB unavailable
    let dbProducts: any[] = [];
    try {
      dbProducts = await (prisma as any).product.findMany({ include: { category: true } });
    } catch (err) {
      // ignore DB errors in demo/dev so imported products still show
      console.warn("DB unavailable, showing imported products only");
      dbProducts = [];
    }

    // Merge: prefer DB price/title/etc when same id exists
    const mergedMap = new Map<string, any>();
    for (const p of importedProducts) mergedMap.set(p.id, p);
    for (const db of dbProducts) {
      const existing = mergedMap.get(db.id);
      const asApi = {
        id: String(db.id),
        title: db.title ?? existing?.title ?? "",
        brand: db.brand ?? existing?.brand ?? "",
        price: typeof db.price === "number" ? db.price : (existing?.price || 0),
        slug: db.slug ?? existing?.slug ?? "",
        images: Array.isArray(db.images) && db.images.length ? db.images : (existing?.images || []),
        category: { name: db.category?.name || existing?.category?.name || "" },
        source: "DB",
        description: db.description ?? existing?.description ?? "",
      };
      mergedMap.set(db.id, asApi);
    }

    // Apply filters on merged list
    const allProducts = Array.from(mergedMap.values());
    const brandSet = new Set<string>();
    const filtered = allProducts.filter((product) => {
      if (search) {
        const s = search.toLowerCase();
        if (!product.title?.toLowerCase().includes(s) && !product.brand?.toLowerCase().includes(s)) return false;
      }
      if (brand && brand !== "all" && product.brand?.toLowerCase() !== brand.toLowerCase()) return false;
      return true;
    })
    // fiyatı olanları en üste getir
    .sort((a: any, b: any) => {
      const ap = typeof a.price === "number" && a.price > 0 ? 1 : 0;
      const bp = typeof b.price === "number" && b.price > 0 ? 1 : 0;
      if (bp !== ap) return bp - ap; // desc
      // ikincil sıralama: başlık
      return (a.title || "").localeCompare(b.title || "");
    });
    for (const p of filtered) if (p.brand) brandSet.add(p.brand);

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedProducts = filtered.slice(skip, skip + limit);

    const uniqueBrands = Array.from(brandSet).sort();

    return NextResponse.json({
      products: paginatedProducts,
      totalPages,
      currentPage: page,
      total,
      brands: uniqueBrands
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({
      products: [],
      totalPages: 1,
      currentPage: 1,
      total: 0,
      brands: []
    });
  }
}

