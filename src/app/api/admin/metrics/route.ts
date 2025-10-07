export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { loadAllImports, buildImportedSlug } from "@/lib/imports";

export async function GET() {
  try {
    const products = await (prisma as any).product.count().catch(()=>0);
    const ordersCount = await (prisma as any).order.count().catch(()=>0);
    const revenueAgg = await (prisma as any).order.aggregate({ _sum: { total: true } }).catch(()=>({ _sum: { total: 0 } }));

    // Last 7 days orders and top products
    const since = new Date(Date.now() - 7*24*60*60*1000);
    const recentOrders = await (prisma as any).order.findMany({
      where: { createdAt: { gte: since } },
      include: { items: true }
    }).catch(()=>[]);

    const seriesBase = Array.from({ length: 7 }).map((_, i)=> ({ day: i, orders: 0 }));
    const productIdToCount = new Map<string, number>();
    for(const o of recentOrders){
      const dayIndex = Math.min(6, Math.max(0, Math.floor((new Date(o.createdAt).getTime() - since.getTime()) / (24*60*60*1000))));
      seriesBase[dayIndex].orders += 1;
      for(const it of (o.items||[])){
        if(!it?.productId) continue;
        productIdToCount.set(it.productId, (productIdToCount.get(it.productId)||0) + (it.qty||1));
      }
    }
    const topIds = Array.from(productIdToCount.entries()).sort((a,b)=> b[1]-a[1]).slice(0,6).map(([id])=>id);
    const topProductsRaw = topIds.length>0 ? await (prisma as any).product.findMany({
      where: { id: { in: topIds } },
      select: { id:true, title:true, slug:true, brand:true, price:true, images:true }
    }).catch(()=>[]) : [];
    let hotProducts = topProductsRaw.map((p:any)=> ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      brand: p.brand,
      price: p.price,
      image: Array.isArray(p.images) && p.images.length>0 ? p.images[0] : null,
      count: productIdToCount.get(p.id)||0
    })).sort((a:any,b:any)=> (b.count||0)-(a.count||0));

    // Fallback to imported JSON catalog when DB is empty
    let productsCount = products;
    if (productsCount === 0) {
      const all = await loadAllImports();
      const uniqueMap = new Map<string, any>();
      for (const { categories } of all) {
        for (const c of categories) {
          for (const it of (c.items || [])) {
            const id = String(it.id || it.url || it.title);
            if (!uniqueMap.has(id)) uniqueMap.set(id, it);
          }
        }
      }
      const list = Array.from(uniqueMap.values());
      productsCount = list.length;
      if (hotProducts.length === 0) {
        hotProducts = list.slice(0, 6).map((p:any)=> ({
          id: String(p.id || p.url || p.title),
          title: p.title,
          slug: buildImportedSlug({ id: String(p.id || p.url || p.title), title: p.title, brand: p.brand, price: p.price, image: p.image }),
          brand: p.brand,
          price: p.price ?? 0,
          image: p.image ?? null,
          count: 0
        }));
      }
    }

    return NextResponse.json({
      products: productsCount,
      orders: ordersCount,
      revenue: revenueAgg?._sum?.total ?? 0,
      last7days: seriesBase,
      hotProducts
    });
  } catch {
    return NextResponse.json({ products: 0, orders: 0, revenue: 0, last7days: [], hotProducts: [] });
  }
}


