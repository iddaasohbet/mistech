"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { PHONE_BRANDS } from "@/data/brands";

export default function SearchBar({ base }: { base: string }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{ id: string; title: string; brand?: string; price?: number; image?: string; slug: string }>>([]);
  const ref = useRef<HTMLDivElement | null>(null);

  const accessory = [
    "Kılıf","Ekran Koruyucu","Kulaklık","Şarj Cihazı","Kablo","Powerbank","Hoparlör","Adaptör"
  ];

  const suggestions = useMemo(() => {
    const lower = q.toLowerCase();
    const brands = PHONE_BRANDS.filter((b) => b.toLowerCase().includes(lower)).slice(0, 6);
    const acc = accessory.filter((a) => a.toLowerCase().includes(lower)).slice(0, 4);
    return { brands, acc };
  }, [q]);

  // Debounced live search
  useEffect(() => {
    let active = true;
    const t = setTimeout(async () => {
      const term = q.trim();
      if (!term) { if (active) setResults([]); return; }
      try {
        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=6`, { cache: 'no-store' });
        const json = await res.json();
        if (active) setResults(Array.isArray(json.products) ? json.products : []);
      } finally { if (active) setLoading(false); }
    }, 220);
    return () => { active = false; clearTimeout(t); };
  }, [q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-2xl z-50">
      <div className="flex items-center gap-2 rounded-md border px-3 h-10 bg-transparent">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              window.location.href = `${base}/kategori/telefonlar?arama=${encodeURIComponent(q)}`;
            }
          }}
          className="w-full bg-transparent outline-none text-sm"
          placeholder="Telefon, parça veya marka ara (örn: iPhone 15 batarya)"
        />
        {q && (
          <button onClick={() => setQ("")} aria-label="Temizle">
            <X className="size-4 text-muted-foreground" />
          </button>
        )}
      </div>
      {open && (q.length > 0) && (
        <div className="absolute left-0 right-0 mt-2 rounded-md border bg-popover text-popover-foreground shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b text-xs text-muted-foreground">Hızlı öneriler</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
            <div>
              <div className="text-xs font-medium mb-2">Markalar</div>
              <ul className="space-y-1 text-sm">
                {suggestions.brands.map((b) => (
                  <li key={b}>
                    <a className="block rounded px-2 py-1 hover:bg-accent hover:text-accent-foreground" href={`${base}/kategori/telefonlar?marka=${encodeURIComponent(b)}`}>{b}</a>
                  </li>
                ))}
                {suggestions.brands.length === 0 && (
                  <li className="text-muted-foreground text-xs">Sonuç yok</li>
                )}
              </ul>
            </div>
            <div>
              <div className="text-xs font-medium mb-2">Kategoriler</div>
              <ul className="space-y-1 text-sm">
                {suggestions.acc.map((a) => (
                  <li key={a}>
                    <a className="block rounded px-2 py-1 hover:bg-accent hover:text-accent-foreground" href={`${base}/kategori/parcalar?alt=${encodeURIComponent(a)}`}>{a}</a>
                  </li>
                ))}
                {suggestions.acc.length === 0 && (
                  <li className="text-muted-foreground text-xs">Sonuç yok</li>
                )}
              </ul>
            </div>
          </div>
          <div className="border-t">
            <div className="p-3 text-xs text-muted-foreground">Ürünler</div>
            <ul className="max-h-64 overflow-auto divide-y">
              {loading && <li className="p-3 text-xs text-muted-foreground">Aranıyor…</li>}
              {!loading && results.length === 0 && (
                <li className="p-3 text-xs text-muted-foreground">Sonuç yok</li>
              )}
              {results.map((p) => (
                <li key={p.id}>
                  <a href={`${base}/urun/${p.slug}`} className="flex items-center gap-3 p-2 hover:bg-accent/40">
                    <img src={p.image || '/next.svg'} alt={p.title} className="h-10 w-10 object-contain bg-white rounded border" />
                    <div className="min-w-0">
                      <div className="text-sm truncate">{p.title}</div>
                      {p.brand && <div className="text-xs text-muted-foreground truncate">{p.brand}</div>}
                    </div>
                    {typeof p.price === 'number' && (
                      <div className="ml-auto text-sm font-medium whitespace-nowrap">₺ {(p.price/100).toLocaleString('tr-TR')}</div>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-3 border-t text-xs text-muted-foreground">Enter ile arayın</div>
        </div>
      )}
    </div>
  );
}


