"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Integration = {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  icon: string;
  config: any;
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/integrations", { cache: "no-store" });
      const j = await r.json();
      setIntegrations(j.integrations || []);
    } catch (e) {
      console.error("Failed to load integrations:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const saveIntegrations = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrations }),
      });

      if (response.ok) {
        alert("Entegrasyon ayarları kaydedildi!");
        setShowEditModal(false);
      } else {
        alert("Kayıt başarısız oldu");
      }
    } catch (e) {
      console.error("Failed to save integrations:", e);
      alert("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = (id: string) => {
    setIntegrations(integrations.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i));
  };

  const openEditModal = (integration: Integration) => {
    setEditingIntegration({ ...integration });
    setShowEditModal(true);
  };

  const saveEditedIntegration = () => {
    if (!editingIntegration) return;
    setIntegrations(integrations.map(i => i.id === editingIntegration.id ? editingIntegration : i));
    setShowEditModal(false);
    setEditingIntegration(null);
  };

  const updateConfig = (key: string, value: string) => {
    if (!editingIntegration) return;
    setEditingIntegration({
      ...editingIntegration,
      config: { ...editingIntegration.config, [key]: value }
    });
  };

  const categories = [
    { value: "all", label: "Tümü" },
    { value: "analytics", label: "Analitik" },
    { value: "marketing", label: "Pazarlama" },
    { value: "email", label: "Email" },
    { value: "communication", label: "İletişim" },
    { value: "reviews", label: "Değerlendirmeler" }
  ];

  const filteredIntegrations = selectedCategory === "all" 
    ? integrations 
    : integrations.filter(i => i.category === selectedCategory);

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      analytics: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      marketing: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      email: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      communication: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      reviews: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Entegrasyonlar</h1>
          <p className="text-sm text-muted-foreground">
            Üçüncü parti servisleri yönetin
          </p>
        </div>
        <Button onClick={saveIntegrations} disabled={saving}>
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            size="sm"
            variant={selectedCategory === cat.value ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground rounded-lg border">
            Yükleniyor...
          </div>
        ) : filteredIntegrations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground rounded-lg border">
            Bu kategoride entegrasyon bulunamadı
          </div>
        ) : (
          filteredIntegrations.map((integration) => (
            <div key={integration.id} className="rounded-lg border bg-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-4xl">{integration.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-semibold text-lg">{integration.name}</h3>
                      <Badge variant={integration.enabled ? "default" : "secondary"}>
                        {integration.enabled ? "Aktif" : "Pasif"}
                      </Badge>
                      <Badge className={getCategoryBadgeColor(integration.category)}>
                        {categories.find(c => c.value === integration.category)?.label || integration.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{integration.description}</p>
                    
                    {integration.enabled && Object.keys(integration.config).length > 0 && (
                      <div className="text-sm space-y-1 bg-muted/30 p-3 rounded">
                        {Object.entries(integration.config).map(([key, value]) => {
                          if (!value) return null;
                          const str = typeof value === 'string'
                            ? (value.length > 30 ? value.substring(0, 30) + '...' : value)
                            : (typeof value === 'object' ? JSON.stringify(value) : String(value));
                          return (
                            <p key={key}>
                              <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {str}
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditModal(integration)}>
                    Ayarla
                  </Button>
                  <Button 
                    size="sm" 
                    variant={integration.enabled ? "secondary" : "default"}
                    onClick={() => toggleEnabled(integration.id)}>
                    {integration.enabled ? "Devre Dışı" : "Aktifleştir"}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showEditModal && editingIntegration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{editingIntegration.icon}</span>
              <div>
                <h2 className="text-xl font-bold">{editingIntegration.name}</h2>
                <p className="text-sm text-muted-foreground">{editingIntegration.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.keys(editingIntegration.config).length === 0 ? (
                <div className="p-4 rounded-lg bg-muted/20">
                  <p className="text-sm text-muted-foreground">
                    Bu entegrasyon için ek ayar gerekmez.
                  </p>
                </div>
              ) : (
                Object.entries(editingIntegration.config).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input
                      type={key.toLowerCase().includes('secret') || key.toLowerCase().includes('token') || key.toLowerCase().includes('key') ? "password" : "text"}
                      value={(value as string) || ""}
                      onChange={(e) => updateConfig(key, e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                      placeholder={`Enter ${key}`}
                    />
                  </div>
                ))
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={editingIntegration.enabled}
                  onChange={(e) => setEditingIntegration({ ...editingIntegration, enabled: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm">Entegrasyonu Aktifleştir</label>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  💡 <span className="font-medium">Not:</span> API anahtarları ve gizli bilgiler güvenli bir şekilde saklanır. 
                  Entegrasyonu aktifleştirmeden önce lütfen tüm gerekli bilgileri doldurun.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => { setShowEditModal(false); setEditingIntegration(null); }}>
                İptal
              </Button>
              <Button onClick={saveEditedIntegration}>
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


