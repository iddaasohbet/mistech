"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Customer = {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  _count: {
    orders: number;
    favorites: number;
  };
  totalSpent: number;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(searchTerm && { search: searchTerm }),
      });
      const r = await fetch(`/api/admin/customers?${params}`, { cache: "no-store" });
      const j = await r.json();
      setCustomers(j.customers || []);
      setTotalPages(j.totalPages || 1);
    } catch (e) {
      console.error("Failed to load customers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    loadCustomers();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Müşteriler</h1>
          <p className="text-sm text-muted-foreground">Tüm müşterileri yönetin</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Müşteri ara (isim veya email)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <Button onClick={handleSearch} variant="outline">Ara</Button>
      </div>

      <div className="rounded-lg border overflow-hidden bg-card">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Yükleniyor...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 font-medium">Müşteri</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Kayıt Tarihi</th>
                    <th className="px-4 py-3 font-medium text-center">Siparişler</th>
                    <th className="px-4 py-3 font-medium text-center">Favoriler</th>
                    <th className="px-4 py-3 font-medium text-right">Toplam Harcama</th>
                    <th className="px-4 py-3 font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-t hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{customer.name || "—"}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {customer.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-4 py-3">{customer.email || "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(customer.createdAt).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline">{customer._count.orders}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline">{customer._count.favorites}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {(customer.totalSpent / 100).toLocaleString("de-DE")} €
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          Detay
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr className="border-t">
                      <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>
                        Müşteri bulunamadı
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Önceki
                </Button>
                <div className="flex items-center px-4 text-sm">
                  Sayfa {page} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Sonraki
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="bg-card rounded-lg shadow-lg max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">Müşteri Detayı</h2>
                  <p className="text-sm text-muted-foreground font-mono mt-1">
                    {selectedCustomer.id}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCustomer(null)}
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">İsim</p>
                  <p className="font-medium">{selectedCustomer.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedCustomer.email || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kayıt Tarihi</p>
                  <p className="font-medium">
                    {new Date(selectedCustomer.createdAt).toLocaleDateString("de-DE")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Harcama</p>
                  <p className="font-bold text-lg">
                    {(selectedCustomer.totalSpent / 100).toLocaleString("de-DE")} €
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{selectedCustomer._count.orders}</div>
                  <div className="text-sm text-muted-foreground">Toplam Sipariş</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{selectedCustomer._count.favorites}</div>
                  <div className="text-sm text-muted-foreground">Favori Ürün</div>
                </div>
              </div>

              {selectedCustomer._count.orders > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Ortalama Sipariş Değeri</p>
                  <p className="font-bold text-lg">
                    {((selectedCustomer.totalSpent / selectedCustomer._count.orders) / 100).toLocaleString("de-DE")} €
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-muted/20 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                Kapat
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


