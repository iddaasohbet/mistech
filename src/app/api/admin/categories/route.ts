export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { loadAllImports } from "@/lib/imports";

export async function GET() {
  try {
    const allImports = await loadAllImports();
    
    // Build categories from imports
    const categories: any[] = [];
    
    // Main brand categories
    const brands = [
      { slug: "app", name: "Apple Parçaları" },
      { slug: "samsung", name: "Samsung Parçaları" },
      { slug: "oppo", name: "OPPO Parçaları" },
      { slug: "xiaomi", name: "Xiaomi Parçaları" },
      { slug: "huawei", name: "Huawei Parçaları" },
      { slug: "oneplus", name: "OnePlus Parçaları" },
      { slug: "realme", name: "Realme Parçaları" },
      { slug: "google", name: "Google Parçaları" },
      { slug: "motorola", name: "Motorola Parçaları" },
      { slug: "nokia", name: "Nokia Parçaları" },
      { slug: "vivo", name: "Vivo Parçaları" },
      { slug: "sony", name: "Sony Parçaları" },
      { slug: "lg", name: "LG Parçaları" },
      { slug: "microsoft", name: "Microsoft Parçaları" },
      { slug: "lenovo", name: "Lenovo Parçaları" },
      { slug: "asus", name: "ASUS Parçaları" },
      { slug: "wiko", name: "Wiko Parçaları" },
      { slug: "zte", name: "ZTE Parçaları" },
      { slug: "nintendo", name: "Nintendo Parçaları" },
    ];

    // Accessories
    const accessories = [
      { slug: "accessories-screen-protectors", name: "Ekran Koruyucular", parentSlug: "accessories" },
      { slug: "accessories-cases-and-covers", name: "Kılıf & Kapaklar", parentSlug: "accessories" },
      { slug: "accessories-holders", name: "Tutucular", parentSlug: "accessories" },
      { slug: "accessories-cables", name: "Kablolar", parentSlug: "accessories" },
      { slug: "accessories-chargers", name: "Şarj Aletleri", parentSlug: "accessories" },
      { slug: "accessories-audio", name: "Ses Ürünleri", parentSlug: "accessories" },
      { slug: "accessories-data-storage", name: "Depolama", parentSlug: "accessories" },
    ];

    // Add parent "Accessories" category
    categories.push({
      id: "accessories",
      name: "Aksesuarlar",
      slug: "accessories",
      parentId: null,
      parent: null,
      _count: { products: 0, children: accessories.length }
    });

    // Add brand categories
    for (const brand of brands) {
      const source = allImports.find(imp => imp.source === brand.slug);
      let productCount = 0;
      if (source) {
        for (const cat of source.categories) {
          productCount += (cat.items || []).length;
        }
      }
      
      categories.push({
        id: brand.slug,
        name: brand.name,
        slug: brand.slug,
        parentId: null,
        parent: null,
        _count: { products: productCount, children: 0 }
      });
    }

    // Add accessory subcategories
    for (const acc of accessories) {
      categories.push({
        id: acc.slug,
        name: acc.name,
        slug: acc.slug,
        parentId: "accessories",
        parent: { name: "Aksesuarlar" },
        _count: { products: 0, children: 0 }
      });
    }

    // Filter out categories with 0 products
    const filteredCategories = categories.filter(cat => cat._count.products > 0);
    
    return NextResponse.json({ categories: filteredCategories.sort((a, b) => a.name.localeCompare(b.name)) });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ categories: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, parentId } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const category = await (prisma as any).category.create({
      data: {
        name,
        slug,
        ...(parentId && { parentId }),
      },
      include: {
        parent: { select: { name: true } },
      }
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

