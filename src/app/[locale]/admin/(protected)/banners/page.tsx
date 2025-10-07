"use client";
import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";

type BannerItem = { href: string; image: string; alt?: string; title?: string; subtitle?: string }; // overlay fields optional
type BannerRow = { title?: string; items: BannerItem[] };

export default function AdminBannersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [rows, setRows] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/admin/banners`, { cache: "no-store" });
        const j = await r.json();
        setRows(Array.isArray(j) ? j : []);
      } finally { setLoading(false); }
    })();
  }, []);

  function addRow() {
    setRows(prev => [...prev, { title: "Yeni Satır", items: [ { href: "/urunler", image: "/banner/sample-1.jpg" }, { href: "/urunler", image: "/banner/sample-2.jpg" }, { href: "/urunler", image: "/banner/sample-3.jpg" } ] }]);
  }

  function duplicateRow(i: number) { setRows(prev => { const copy=[...prev]; copy.splice(i+1,0, JSON.parse(JSON.stringify(copy[i]))); return copy; }); }
  function removeRow(i: number) { setRows(prev => prev.filter((_,idx)=> idx!==i)); }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/banners`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rows) });
      if (!res.ok) alert("Kaydedilemedi");
    } finally { setSaving(false); }
  }

  if (loading) return <div className="p-6">Yükleniyor...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Banner Alanları</h1>
          <p className="text-sm text-muted-foreground">3'lü satırlar, overlay yazılar ve çoğaltma</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addRow}>+ Satır Ekle</Button>
          <Button onClick={save} disabled={saving}>{saving?"Kaydediliyor...":"Kaydet"}</Button>
        </div>
      </div>

      <div className="space-y-6">
        {rows.map((row, idx) => (
          <div key={idx} className="rounded-lg border">
            <div className="flex items-center justify-between p-3 border-b">
              <input value={row.title||""} onChange={(e)=>{
                const v=e.target.value; setRows(prev=>prev.map((r,i)=> i===idx?{...r,title:v}:r));
              }} className="text-sm font-medium px-2 py-1 rounded border w-64" placeholder="Satır başlığı (opsiyonel)" />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={()=>duplicateRow(idx)}>Çoğalt</Button>
                <Button size="sm" variant="destructive" onClick={()=>removeRow(idx)}>Sil</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 p-3">
              {row.items.map((it, j) => (
                <div key={j} className="rounded-md border p-3 space-y-2">
                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-xs text-muted-foreground">Görsel URL</label>
                    <input value={it.image} onChange={(e)=>{
                      const v=e.target.value; setRows(prev=>prev.map((r,i)=> i===idx?{...r,items:r.items.map((x,k)=> k===j?{...x,image:v}:x)}:r));
                    }} className="rounded-md border px-2 py-1 text-sm" placeholder="/banner/...jpg veya https://..." />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-xs text-muted-foreground">Bağlantı</label>
                    <input value={it.href} onChange={(e)=>{
                      const v=e.target.value; setRows(prev=>prev.map((r,i)=> i===idx?{...r,items:r.items.map((x,k)=> k===j?{...x,href:v}:x)}:r));
                    }} className="rounded-md border px-2 py-1 text-sm" placeholder="/urunler veya https://..." />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Başlık (overlay)</label>
                      <input value={it.title||""} onChange={(e)=>{
                        const v=e.target.value; setRows(prev=>prev.map((r,i)=> i===idx?{...r,items:r.items.map((x,k)=> k===j?{...x,title:v}:x)}:r));
                      }} className="rounded-md border px-2 py-1 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Alt Başlık</label>
                      <input value={it.subtitle||""} onChange={(e)=>{
                        const v=e.target.value; setRows(prev=>prev.map((r,i)=> i===idx?{...r,items:r.items.map((x,k)=> k===j?{...x,subtitle:v}:x)}:r));
                      }} className="rounded-md border px-2 py-1 text-sm" />
                    </div>
                  </div>
                  <div className="rounded overflow-hidden border bg-muted/20">
                    <img src={it.image} alt={it.alt||""} className="w-full h-32 object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


