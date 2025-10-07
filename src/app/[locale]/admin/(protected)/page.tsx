import StatCard from "@/components/admin/StatCard";
import AreaMini from "@/components/admin/AreaMini";
import RightPanel from "@/components/admin/RightPanel";
import HotProducts from "@/components/admin/HotProducts";
import RecentOrders from "@/components/admin/RecentOrders";
import QuickActions from "@/components/admin/QuickActions";
import { loadAllImports, buildImportedSlug } from "@/lib/imports";

async function loadMetrics(){
  try{ const r=await fetch("/api/admin/metrics",{ cache:"no-store"}); return await r.json(); }catch{ return { products:0, orders:0, revenue:0, last7days:[]}; }
}

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = await loadMetrics();
  let productsCount = m.products || 0;
  let hot = m.hotProducts || [];
  // Build series strictly from API; no demo fallback
  const series = Array.isArray(m.last7days) ? m.last7days : [];
  const totalOrdersWeek = series.reduce((sum: number, d: any) => sum + (d.orders||0), 0);
  const avgPerDay = Math.round(totalOrdersWeek / 7);
  const best = series.reduce((acc: { orders: number; idx: number }, d: any, idx: number) => d.orders > acc.orders ? { orders: d.orders, idx } : acc, { orders: -1, idx: 0 });
  if (productsCount === 0) {
    const all = await loadAllImports();
    const map = new Map<string, any>();
    for (const { categories } of all) {
      for (const c of categories) {
        for (const it of (c.items || [])) {
          const id = String(it.id || it.url || it.title);
          if (!map.has(id)) map.set(id, it);
        }
      }
    }
    const list = Array.from(map.values());
    productsCount = list.length;
    if (!hot || hot.length === 0) {
      hot = list.slice(0, 6).map((p:any)=> ({
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
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-6">
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 xl:grid-cols-3">
          <StatCard title="Toplam Ürün" value={productsCount} hint="Katalog" />
          <StatCard title="Toplam Sipariş" value={m.orders} delta={{ value: "+12%", positive: true }} />
          <StatCard title="Ciro" value={`${(m.revenue/100).toLocaleString("de-DE")} €`} />
        </div>
        <div className="rounded-lg border p-4">
          <div className="font-medium mb-4">Son 7 Gün Sipariş</div>
          <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
            <div className="rounded-md border p-2">
              <div className="text-xs text-muted-foreground">Toplam</div>
              <div className="font-medium">{totalOrdersWeek.toLocaleString("tr-TR")}</div>
            </div>
            <div className="rounded-md border p-2">
              <div className="text-xs text-muted-foreground">Günlük Ortalama</div>
              <div className="font-medium">{avgPerDay.toLocaleString("tr-TR")}</div>
            </div>
            <div className="rounded-md border p-2">
              <div className="text-xs text-muted-foreground">En İyi Gün</div>
              <div className="font-medium">Gün {best.idx + 1} • {best.orders.toLocaleString("tr-TR")}</div>
            </div>
          </div>
          <AreaMini series={series} />
        </div>
        <HotProducts items={hot} locale={locale} />
        <RecentOrders />
        <QuickActions base={`/${locale}/admin`} />
      </div>
      <RightPanel />
    </div>
  );
}


