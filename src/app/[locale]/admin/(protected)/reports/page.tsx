"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type ReportData = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  avgOrderValue: number;
  revenueByMonth: Array<{ month: string; revenue: number; orders: number }>;
  topProducts: Array<{ id: string; title: string; brand: string; totalSales: number; orderCount: number }>;
  topCustomers: Array<{ id: string; name: string; email: string; totalSpent: number; orderCount: number }>;
  ordersByStatus: Array<{ status: string; count: number }>;
};

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>("30");

  const loadReports = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/reports?days=${dateRange}`, { cache: "no-store" });
      const j = await r.json();
      setData(j);
    } catch (e) {
      console.error("Failed to load reports:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Veri yüklenemedi</div>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Beklemede",
      processing: "İşleniyor",
      shipped: "Kargoda",
      delivered: "Teslim Edildi",
      cancelled: "İptal Edildi",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Raporlar</h1>
          <p className="text-sm text-muted-foreground">Satış ve performans raporları</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="7">Son 7 Gün</option>
            <option value="30">Son 30 Gün</option>
            <option value="90">Son 90 Gün</option>
            <option value="365">Son 1 Yıl</option>
          </select>
          <Button onClick={loadReports} variant="outline">Yenile</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm text-muted-foreground mb-1">Toplam Ciro</div>
          <div className="text-2xl font-bold">{(data.totalRevenue / 100).toLocaleString("de-DE")} €</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm text-muted-foreground mb-1">Toplam Sipariş</div>
          <div className="text-2xl font-bold">{data.totalOrders.toLocaleString("de-DE")}</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm text-muted-foreground mb-1">Toplam Müşteri</div>
          <div className="text-2xl font-bold">{data.totalCustomers.toLocaleString("de-DE")}</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm text-muted-foreground mb-1">Ortalama Sipariş</div>
          <div className="text-2xl font-bold">{(data.avgOrderValue / 100).toLocaleString("de-DE")} €</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Aylık Ciro</h2>
          </div>
          <div className="p-6">
            {data.revenueByMonth.length > 0 ? (
              <div className="space-y-4">
                {data.revenueByMonth.map((item) => (
                  <div key={item.month} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{item.month}</div>
                      <div className="text-sm text-muted-foreground">{item.orders} sipariş</div>
                    </div>
                    <div className="font-semibold">{(item.revenue / 100).toLocaleString("de-DE")} €</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">Veri yok</div>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Sipariş Durumları</h2>
          </div>
          <div className="p-6">
            {data.ordersByStatus.length > 0 ? (
              <div className="space-y-4">
                {data.ordersByStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="font-medium">{getStatusLabel(item.status)}</div>
                    <div className="text-lg font-semibold">{item.count.toLocaleString("de-DE")}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">Veri yok</div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">En Çok Satan Ürünler</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground bg-muted/30">
              <tr>
                <th className="px-6 py-3 font-medium">Ürün</th>
                <th className="px-6 py-3 font-medium">Marka</th>
                <th className="px-6 py-3 font-medium text-right">Satış Adedi</th>
                <th className="px-6 py-3 font-medium text-right">Toplam Satış</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.length > 0 ? (
                data.topProducts.map((product) => (
                  <tr key={product.id} className="border-t hover:bg-muted/20">
                    <td className="px-6 py-3 font-medium">{product.title}</td>
                    <td className="px-6 py-3">{product.brand}</td>
                    <td className="px-6 py-3 text-right">{product.orderCount.toLocaleString("de-DE")}</td>
                    <td className="px-6 py-3 text-right font-semibold">
                      {(product.totalSales / 100).toLocaleString("de-DE")} €
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t">
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    Veri yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">En Değerli Müşteriler</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground bg-muted/30">
              <tr>
                <th className="px-6 py-3 font-medium">Müşteri</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium text-right">Sipariş Sayısı</th>
                <th className="px-6 py-3 font-medium text-right">Toplam Harcama</th>
              </tr>
            </thead>
            <tbody>
              {data.topCustomers.length > 0 ? (
                data.topCustomers.map((customer) => (
                  <tr key={customer.id} className="border-t hover:bg-muted/20">
                    <td className="px-6 py-3 font-medium">{customer.name || "—"}</td>
                    <td className="px-6 py-3">{customer.email}</td>
                    <td className="px-6 py-3 text-right">{customer.orderCount.toLocaleString("de-DE")}</td>
                    <td className="px-6 py-3 text-right font-semibold">
                      {(customer.totalSpent / 100).toLocaleString("de-DE")} €
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t">
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    Veri yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

