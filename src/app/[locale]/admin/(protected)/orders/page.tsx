"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type OrderItem = {
  id: string;
  productId: string;
  qty: number;
  price: number;
  product?: { title: string; brand: string };
};

type Order = {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  user?: { email?: string; name?: string };
  items: OrderItem[];
  trackingNumber?: string;
  carrier?: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("ups");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });
      const r = await fetch(`/api/admin/orders?${params}`, {
        cache: "no-store",
      });
      const j = await r.json();
      setOrders(j.orders || []);
      setTotalPages(j.totalPages || 1);
    } catch (e) {
      console.error("Failed to load orders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (e) {
      console.error("Failed to update order:", e);
    }
  };

  const openTrackingModal = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumber(order.trackingNumber || "");
    setCarrier(order.carrier || "ups");
    setShowTrackingModal(true);
  };

  const addTracking = async () => {
    if (!selectedOrder || !trackingNumber.trim()) {
      alert("Lütfen takip numarası girin");
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}/tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber, carrier }),
      });

      if (response.ok) {
        alert("Takip numarası eklendi!");
        setShowTrackingModal(false);
        await loadOrders();
      } else {
        alert("Bir hata oluştu");
      }
    } catch (e) {
      console.error("Failed to add tracking:", e);
      alert("Bir hata oluştu");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Siparişler</h1>
          <p className="text-sm text-muted-foreground">Tüm siparişleri yönetin</p>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="all">Tümü</option>
            <option value="pending">Beklemede</option>
            <option value="processing">İşleniyor</option>
            <option value="shipped">Kargoda</option>
            <option value="delivered">Teslim Edildi</option>
            <option value="cancelled">İptal Edildi</option>
          </select>
        </div>
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
                    <th className="px-4 py-3 font-medium">Sipariş ID</th>
                    <th className="px-4 py-3 font-medium">Tarih</th>
                    <th className="px-4 py-3 font-medium">Müşteri</th>
                    <th className="px-4 py-3 font-medium">Ürün Adedi</th>
                    <th className="px-4 py-3 font-medium">Tutar</th>
                    <th className="px-4 py-3 font-medium">Durum</th>
                    <th className="px-4 py-3 font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleString("tr-TR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{order.user?.name || "—"}</span>
                          <span className="text-xs text-muted-foreground">{order.user?.email || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {(order.items || []).reduce((a, it) => a + (it.qty || 1), 0)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">
                        {(order.total / 100).toLocaleString("de-DE")} €
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                          Detay
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr className="border-t">
                      <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>
                        Sipariş bulunamadı
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Önceki
                </Button>
                <div className="flex items-center px-4 text-sm">
                  Sayfa {page} / {totalPages}
                </div>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Sonraki
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedOrder(null)}>
          <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">Sipariş Detayı</h2>
                  <p className="text-sm text-muted-foreground font-mono mt-1">#{selectedOrder.id}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>✕</Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tarih</p>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString("tr-TR")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Durum</p>
                  <Badge className={getStatusColor(selectedOrder.status)}>{getStatusLabel(selectedOrder.status)}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Müşteri</p>
                  <p className="font-medium">{selectedOrder.user?.name || "—"}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                  <p className="font-bold text-lg">{(selectedOrder.total / 100).toLocaleString("de-DE")} €</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Ürünler</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.title || "Ürün"}</p>
                        <p className="text-sm text-muted-foreground">{item.product?.brand}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.qty} × {(item.price / 100).toLocaleString("de-DE")} €</p>
                        <p className="text-sm text-muted-foreground">{((item.qty * item.price) / 100).toLocaleString("de-DE")} €</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Kargo Takip</h3>
                {selectedOrder.trackingNumber ? (
                  <div className="p-4 rounded-lg border bg-muted/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-muted-foreground">Takip Numarası</p>
                        <p className="font-mono font-medium">{selectedOrder.trackingNumber}</p>
                        <p className="text-xs text-muted-foreground mt-1">Kargo: {selectedOrder.carrier?.toUpperCase()}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openTrackingModal(selectedOrder)}>
                        Güncelle
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => openTrackingModal(selectedOrder)}>
                    + Takip Numarası Ekle
                  </Button>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3">Durum Güncelle</h3>
                <div className="flex flex-wrap gap-2">
                  {["pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                    <Button key={status} size="sm" variant={selectedOrder.status === status ? "default" : "outline"} onClick={() => updateOrderStatus(selectedOrder.id, status)}>
                      {getStatusLabel(status)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTrackingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Kargo Takip Numarası</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kargo Şirketi</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="ups">UPS</option>
                  <option value="dhl">DHL</option>
                  <option value="fedex">FedEx</option>
                  <option value="dpd">DPD</option>
                  <option value="hermes">Hermes</option>
                  <option value="other">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Takip Numarası</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                  placeholder="1Z999AA10123456784"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Bu numara müşteriye otomatik olarak iletilecektir
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowTrackingModal(false)}>
                İptal
              </Button>
              <Button onClick={addTracking}>
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
