export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { loadAllImports } from "@/lib/imports";

export async function GET() {
  try {
    const allImports = await loadAllImports();
    
    const brands = [
      { slug: "app", name: "Apple" },
      { slug: "samsung", name: "Samsung" },
      { slug: "oppo", name: "OPPO" },
      { slug: "xiaomi", name: "Xiaomi" },
      { slug: "huawei", name: "Huawei" },
      { slug: "oneplus", name: "OnePlus" },
      { slug: "realme", name: "Realme" },
      { slug: "google", name: "Google" },
      { slug: "motorola", name: "Motorola" },
      { slug: "nokia", name: "Nokia" },
      { slug: "vivo", name: "Vivo" },
      { slug: "sony", name: "Sony" },
      { slug: "lg", name: "LG" },
      { slug: "microsoft", name: "Microsoft" },
      { slug: "lenovo", name: "Lenovo" },
      { slug: "asus", name: "ASUS" },
      { slug: "wiko", name: "Wiko" },
      { slug: "zte", name: "ZTE" },
      { slug: "nintendo", name: "Nintendo" },
    ];

    const brandsWithCount = brands.map(brand => {
      const source = allImports.find(imp => imp.source === brand.slug);
      let productCount = 0;
      
      if (source) {
        for (const cat of source.categories) {
          productCount += (cat.items || []).length;
        }
      }
      
      return {
        slug: brand.slug,
        name: brand.name,
        productCount
      };
    });

    // Filter out brands with 0 products
    const filteredBrands = brandsWithCount.filter(b => b.productCount > 0);
    
    return NextResponse.json({ 
      brands: filteredBrands.sort((a, b) => b.productCount - a.productCount) 
    });
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return NextResponse.json({ brands: [] });
  }
}


