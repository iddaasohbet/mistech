"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Settings = {
  siteName: string;
  siteDescription: string;
  logo: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  currency: string;
  currencySymbol: string;
  language: string;
  timezone: string;
  metaKeywords: string;
  metaDescription: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    siteName: "",
    siteDescription: "",
    logo: "",
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    socialMedia: { facebook: "", instagram: "", twitter: "", linkedin: "" },
    currency: "EUR",
    currencySymbol: "€",
    language: "de",
    timezone: "Europe/Berlin",
    metaKeywords: "",
    metaDescription: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/admin/settings", { cache: "no-store" });
        const j = await r.json();
        if (j.settings) setSettings(j.settings);
      } catch (e) {
        console.error("Failed to load settings:", e);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (response.ok) {
        alert("Ayarlar başarıyla kaydedildi!");
      } else {
        alert("Kayıt başarısız oldu");
      }
    } catch (e) {
      console.error("Failed to save settings:", e);
      alert("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Genel Ayarlar</h1>
          <p className="text-sm text-muted-foreground">Site genelinde kullanılan ayarları yönetin</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Site Bilgileri</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Site Adı</label>
            <input type="text" value={settings.siteName}
              onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Premium Shop" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Site Açıklaması</label>
            <textarea value={settings.siteDescription}
              onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
              className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Logo URL</label>
            <input type="text" value={settings.logo}
              onChange={(e) => setSettings({...settings, logo: e.target.value})}
              className="w-full rounded-md border px-3 py-2 text-sm" placeholder="/logo.png" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">İletişim Bilgileri</h2>
          <div>
            <label className="block text-sm font-medium mb-2">E-posta</label>
            <input type="email" value={settings.contactEmail}
              onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
              className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Telefon</label>
            <input type="text" value={settings.contactPhone}
              onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
              className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Adres</label>
            <textarea value={settings.contactAddress}
              onChange={(e) => setSettings({...settings, contactAddress: e.target.value})}
              className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px]" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Sosyal Medya</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Facebook</label>
            <input type="url" value={settings.socialMedia.facebook}
              onChange={(e) => setSettings({...settings, socialMedia: {...settings.socialMedia, facebook: e.target.value}})}
              className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Instagram</label>
            <input type="url" value={settings.socialMedia.instagram}
              onChange={(e) => setSettings({...settings, socialMedia: {...settings.socialMedia, instagram: e.target.value}})}
              className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Twitter / X</label>
            <input type="url" value={settings.socialMedia.twitter}
              onChange={(e) => setSettings({...settings, socialMedia: {...settings.socialMedia, twitter: e.target.value}})}
              className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">LinkedIn</label>
            <input type="url" value={settings.socialMedia.linkedin}
              onChange={(e) => setSettings({...settings, socialMedia: {...settings.socialMedia, linkedin: e.target.value}})}
              className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Bölgesel Ayarlar</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Para Birimi</label>
              <select value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="TRY">TRY</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Simge</label>
              <input type="text" value={settings.currencySymbol}
                onChange={(e) => setSettings({...settings, currencySymbol: e.target.value})}
                className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">SEO</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Meta Kelimeler</label>
            <input type="text" value={settings.metaKeywords}
              onChange={(e) => setSettings({...settings, metaKeywords: e.target.value})}
              className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Meta Açıklama</label>
            <textarea value={settings.metaDescription}
              onChange={(e) => setSettings({...settings, metaDescription: e.target.value})}
              className="w-full rounded-md border px-3 py-2 text-sm min-h-[100px]" />
          </div>
        </div>
      </div>

      <div className="flex justify-end p-4 border-t bg-muted/20 rounded-lg sticky bottom-0">
        <Button onClick={saveSettings} disabled={saving} size="lg">
          {saving ? "Kaydediliyor..." : "Tüm Ayarları Kaydet"}
        </Button>
      </div>
    </div>
  );
}


