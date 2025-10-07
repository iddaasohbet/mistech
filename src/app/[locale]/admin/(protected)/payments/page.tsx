"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PaymentMethod = {
  id: string;
  name: string;
  description: string;
  type: string;
  enabled: boolean;
  icon: string;
  config: any;
};

export default function PaymentsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadMethods = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/payments", { cache: "no-store" });
      const j = await r.json();
      setMethods(j.methods || []);
    } catch (e) {
      console.error("Failed to load payment methods:", e);
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
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ methods }),
      });

      if (response.ok) {
        alert("Ödeme ayarları kaydedildi!");
        setShowEditModal(false);
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

  const openEditModal = (method: PaymentMethod) => {
    setEditingMethod({ ...method });
    setShowEditModal(true);
  };

  const saveEditedMethod = () => {
    if (!editingMethod) return;
    setMethods(methods.map(m => m.id === editingMethod.id ? editingMethod : m));
    setShowEditModal(false);
    setEditingMethod(null);
  };

  const updateConfig = (key: string, value: string) => {
    if (!editingMethod) return;
    setEditingMethod({
      ...editingMethod,
      config: { ...editingMethod.config, [key]: value }
    });
  };

  const getPaymentIcon = (icon: string) => {
    const icons: Record<string, string> = {
      bank: "🏦",
      paypal: "💳",
      "credit-card": "💳",
      klarna: "🛍️",
      cash: "💵"
    };
    return icons[icon] || "💰";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Ödeme Yöntemleri</h1>
          <p className="text-sm text-muted-foreground">
            Müşterilere sunulan ödeme seçeneklerini yönetin
          </p>
        </div>
        <Button onClick={saveMethods} disabled={saving}>
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground rounded-lg border">
            Yükleniyor...
          </div>
        ) : (
          methods.map((method) => (
            <div key={method.id} className="rounded-lg border bg-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-4xl">{getPaymentIcon(method.icon)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg">{method.name}</h3>
                      <Badge variant={method.enabled ? "default" : "secondary"}>
                        {method.enabled ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                    
                    {method.type === "bank_transfer" && method.config?.iban && (
                      <div className="text-sm space-y-1 bg-muted/30 p-3 rounded">
                        <p><span className="font-medium">Banka:</span> {method.config.bankName}</p>
                        <p><span className="font-medium">IBAN:</span> {method.config.iban}</p>
                        <p><span className="font-medium">BIC:</span> {method.config.bic}</p>
                        <p><span className="font-medium">Hesap Sahibi:</span> {method.config.accountHolder}</p>
                      </div>
                    )}

                    {method.type === "paypal" && method.config?.clientId && (
                      <div className="text-sm space-y-1 bg-muted/30 p-3 rounded">
                        <p><span className="font-medium">Client ID:</span> {method.config.clientId.substring(0, 20)}...</p>
                        <p><span className="font-medium">Mode:</span> {method.config.mode}</p>
                      </div>
                    )}

                    {method.type === "credit_card" && method.config?.provider && (
                      <div className="text-sm space-y-1 bg-muted/30 p-3 rounded">
                        <p><span className="font-medium">Provider:</span> {method.config.provider}</p>
                        {method.config.publicKey && (
                          <p><span className="font-medium">Public Key:</span> {method.config.publicKey.substring(0, 20)}...</p>
                        )}
                      </div>
                    )}

                    {method.type === "klarna" && method.config?.region && (
                      <div className="text-sm space-y-1 bg-muted/30 p-3 rounded">
                        <p><span className="font-medium">Region:</span> {method.config.region.toUpperCase()}</p>
                      </div>
                    )}
                  </div>
                </div>

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
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showEditModal && editingMethod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingMethod.name} - Ayarları Düzenle
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Açıklama</label>
                <input
                  type="text"
                  value={editingMethod.description}
                  onChange={(e) => setEditingMethod({ ...editingMethod, description: e.target.value })}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>

              {editingMethod.type === "bank_transfer" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Banka Adı</label>
                    <input
                      type="text"
                      value={editingMethod.config?.bankName || ""}
                      onChange={(e) => updateConfig("bankName", e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="Deutsche Bank"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">IBAN</label>
                    <input
                      type="text"
                      value={editingMethod.config?.iban || ""}
                      onChange={(e) => updateConfig("iban", e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                      placeholder="DE89 3704 0044 0532 0130 00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">BIC/SWIFT</label>
                    <input
                      type="text"
                      value={editingMethod.config?.bic || ""}
                      onChange={(e) => updateConfig("bic", e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                      placeholder="COBADEFFXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hesap Sahibi</label>
                    <input
                      type="text"
                      value={editingMethod.config?.accountHolder || ""}
                      onChange={(e) => updateConfig("accountHolder", e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="Premium Shop GmbH"
                    />
                  </div>
                </>
              )}

              {editingMethod.type === "paypal" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">PayPal Client ID</label>
                    <input
                      type="text"
                      value={editingMethod.config?.clientId || ""}
                      onChange={(e) => updateConfig("clientId", e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                      placeholder="AeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">PayPal Client Secret</label>
                    <input
                      type="password"
                      value={editingMethod.config?.clientSecret || ""}
                      onChange={(e) => updateConfig("clientSecret", e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                      placeholder="EXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Mode</label>
                    <select
                      value={editingMethod.config?.mode || "sandbox"}
                      onChange={(e) => updateConfig("mode", e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    >
                      <option value="sandbox">Sandbox (Test)</option>
                      <option value="live">Live (Canlı)</option>
                    </select>
                  </div>
                </>
              )}

              {editingMethod.type === "credit_card" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Sağlayıcı</label>
                    <select
                      value={editingMethod.config?.provider || "stripe"}
                      onChange={(e) => updateConfig("provider", e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    >
                      <option value="stripe">Stripe</option>
                      <option value="square">Square</option>
                      <option value="braintree">Braintree</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Public Key</label>
                    <input
                      type="text"
                      value={editingMethod.config?.publicKey || ""}
                      onChange={(e) => updateConfig("publicKey", e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                      placeholder="pk_test_XXXXXXXXXXXXXXXXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Secret Key</label>
                    <input
                      type="password"
                      value={editingMethod.config?.secretKey || ""}
                      onChange={(e) => updateConfig("secretKey", e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                      placeholder="sk_test_your_stripe_secret_key_here"
                    />
                  </div>
                </>
              )}

              {editingMethod.type === "klarna" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">API Key</label>
                    <input
                      type="text"
                      value={editingMethod.config?.apiKey || ""}
                      onChange={(e) => updateConfig("apiKey", e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                      placeholder="klarna_XXXXXXXXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">API Secret</label>
                    <input
                      type="password"
                      value={editingMethod.config?.apiSecret || ""}
                      onChange={(e) => updateConfig("apiSecret", e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                      placeholder="XXXXXXXXXXXXXXXXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Region</label>
                    <select
                      value={editingMethod.config?.region || "eu"}
                      onChange={(e) => updateConfig("region", e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    >
                      <option value="eu">Europe</option>
                      <option value="na">North America</option>
                      <option value="oc">Oceania</option>
                    </select>
                  </div>
                </>
              )}

              {editingMethod.type === "cash" && (
                <div className="p-4 rounded-lg bg-muted/20">
                  <p className="text-sm text-muted-foreground">
                    Bu ödeme yöntemi için ek ayar gerekmez. Müşteriler ürünü teslim alırken nakit ödeme yapabilir.
                  </p>
                </div>
              )}

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
              <Button variant="outline" onClick={() => { setShowEditModal(false); setEditingMethod(null); }}>
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


