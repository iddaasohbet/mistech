"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ShippingMethod = {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  enabled: boolean;
  carrier: string;
};

export default function ShippingPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadMethods = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/shipping", { cache: "no-store" });
      const j = await r.json();
      setMethods(j.methods || []);
    } catch (e) {
      console.error("Failed to load shipping methods:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const saveMethods = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ methods }),
      });

      if (response.ok) {
        alert("Kargo ayarları kaydedildi!");
        setEditingMethod(null);
        setShowAddModal(false);
      } else {
        alert("Kayıt başarısız oldu");
      }
    } catch (e) {
      console.error("Failed to save methods:", e);
      alert("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = (id: string) => {
    setMethods(methods.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const deleteMethod = (id: string) => {
    if (confirm("Bu kargo yöntemini silmek istediğinize emin misiniz?")) {
      setMethods(methods.filter(m => m.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingMethod({
      id: `method-${Date.now()}`,
      name: "",
      description: "",
      price: 0,
      estimatedDays: "2-3",
      enabled: true,
      carrier: "other"
    });
    setShowAddModal(true);
  };

  const openEditModal = (method: ShippingMethod) => {
    setEditingMethod({ ...method });
    setShowAddModal(true);
  };

  const saveEditedMethod = () => {
    if (!editingMethod) return;
    
    const exists = methods.find(m => m.id === editingMethod.id);
    if (exists) {
      setMethods(methods.map(m => m.id === editingMethod.id ? editingMethod : m));
    } else {
      setMethods([...methods, editingMethod]);
    }
    setShowAddModal(false);
    setEditingMethod(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Kargo Yöntemleri</h1>
          <p className="text-sm text-muted-foreground">
            Müşterilere sunulan kargo seçeneklerini yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openAddModal} variant="outline">
            + Yeni Kargo Yöntemi
          </Button>
          <Button onClick={saveMethods} disabled={saving}>
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden bg-card">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Yükleniyor...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground bg-muted/30">
                <tr>
                  <th className="px-4 py-3 font-medium">Kargo Yöntemi</th>
                  <th className="px-4 py-3 font-medium">Taşıyıcı</th>
                  <th className="px-4 py-3 font-medium">Fiyat</th>
                  <th className="px-4 py-3 font-medium">Süre</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                  <th className="px-4 py-3 font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {methods.map((method) => (
                  <tr key={method.id} className="border-t hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="font-medium">{method.name}</div>
                      <div className="text-xs text-muted-foreground">{method.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{method.carrier.toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {method.price === 0 ? "Ücretsiz" : `${(method.price / 100).toLocaleString("de-DE")} €`}
                    </td>
                    <td className="px-4 py-3">
                      {method.estimatedDays === "0" ? "Anında" : `${method.estimatedDays} gün`}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={method.enabled ? "default" : "secondary"}>
                        {method.enabled ? "Aktif" : "Pasif"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditModal(method)}>
                          Düzenle
                        </Button>
                        <Button 
                          size="sm" 
                          variant={method.enabled ? "secondary" : "default"}
                          onClick={() => toggleEnabled(method.id)}
                        >
                          {method.enabled ? "Pasifleştir" : "Aktifleştir"}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMethod(method.id)}>
                          Sil
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {methods.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Henüz kargo yöntemi eklenmemiş
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && editingMethod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {methods.find(m => m.id === editingMethod.id) ? "Kargo Yöntemini Düzenle" : "Yeni Kargo Yöntemi"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Yöntem Adı</label>
                <input
                  type="text"
                  value={editingMethod.name}
                  onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Örn: UPS Standard"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Açıklama</label>
                <textarea
                  value={editingMethod.description}
                  onChange={(e) => setEditingMethod({ ...editingMethod, description: e.target.value })}
                  className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px]"
                  placeholder="Kargo yöntemi hakkında açıklama"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Fiyat (EUR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingMethod.price / 100}
                    onChange={(e) => {
                      const eurValue = parseFloat(e.target.value) || 0;
                      setEditingMethod({ ...editingMethod, price: Math.round(eurValue * 100) });
                    }}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="8.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tahmini Süre</label>
                  <input
                    type="text"
                    value={editingMethod.estimatedDays}
                    onChange={(e) => setEditingMethod({ ...editingMethod, estimatedDays: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="2-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Taşıyıcı Firma</label>
                <select
                  value={editingMethod.carrier}
                  onChange={(e) => setEditingMethod({ ...editingMethod, carrier: e.target.value })}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="pickup">Selbst Abholen (Elden Teslim)</option>
                  <option value="ups">UPS</option>
                  <option value="dhl">DHL</option>
                  <option value="fedex">FedEx</option>
                  <option value="dpd">DPD</option>
                  <option value="hermes">Hermes</option>
                  <option value="other">Diğer</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingMethod.enabled}
                  onChange={(e) => setEditingMethod({ ...editingMethod, enabled: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm">Aktif</label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => { setShowAddModal(false); setEditingMethod(null); }}>
                İptal
              </Button>
              <Button onClick={saveEditedMethod}>
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


