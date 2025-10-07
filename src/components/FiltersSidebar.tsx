"use client";
import { useMemo, useState } from "react";
import { PHONE_BRANDS } from "@/data/brands";

type Group = { label: string; count: number };

export default function FiltersSidebar({ locale, allTotal, groups, basePath, currentModel }: { locale: string; allTotal: number; groups: Group[]; basePath: string; currentModel?: string }) {
  const [q, setQ] = useState("");
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);
  const nq = (currentModel || "").toLowerCase().replace(/\s+/g, " ").trim();
  const filtered = useMemo(() => {
    const l = q.toLowerCase().trim();
    if (!l) return groups;
    return groups.filter((g) => g.label.toLowerCase().includes(l));
  }, [q, groups]);

  return (
    <div className="rounded-md border p-3 space-y-6">
      <div>
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          placeholder="Alt kategori ara"
          className="w-full h-9 px-3 rounded-md border text-sm"
        />
      </div>

      <div>
        <div className="font-medium mb-2">Marka</div>
        <ul className="space-y-2 max-h-56 overflow-auto pr-1 text-sm">
          {PHONE_BRANDS.map((b) => {
            const map: Record<string, string> = {
              "apple": "app",
              "samsung": "samsung",
              "xiaomi": "xiaomi",
              "huawei": "huawei",
              "oneplus": "oneplus",
              "oppo": "oppo",
              "vivo": "vivo",
              "google": "google",
              "realme": "realme",
              "nokia": "nokia",
              "motorola": "motorola",
              "sony": "sony",
              "lg": "lg",
              "microsoft": "microsoft",
              "lenovo": "lenovo",
              "asus": "asus",
              "wiko": "wiko",
              "zte": "zte",
            };
            const slug = map[b.toLowerCase()];
            const href = slug ? `/${locale}/kategori/${slug}` : `/${locale}/kategori/telefonlar?marka=${encodeURIComponent(b)}`;
            return (
              <li key={b} className="flex items-center gap-2">
                <input type="checkbox" readOnly />
                <a href={href} className="hover:underline">{b}</a>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <div className="font-medium mb-2">Fiyat</div>
        <div className="px-1">
          <input type="range" min={0} max={100} value={min} onChange={(e)=>setMin(Number(e.target.value))} className="w-full" />
          <input type="range" min={0} max={100} value={max} onChange={(e)=>setMax(Number(e.target.value))} className="w-full -mt-2" />
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>€ {min}</span>
            <span>€ {max}</span>
          </div>
          <a href={`/${locale}/kategori/telefonlar?fiyat=${encodeURIComponent(`${min}-${max}`)}`} className="mt-2 inline-flex h-8 px-3 items-center justify-center rounded-md border text-xs hover:bg-accent/50">Uygula</a>
        </div>
      </div>

      <div>
        <div className="font-medium mb-2">Alt Kategoriler</div>
        <a href={`/${locale}/kategori/${basePath}`} className={`block text-sm px-2 py-1 rounded ${!nq? 'bg-accent/50':'hover:bg-accent/30'}`}>Tümü ({allTotal.toLocaleString('tr-TR')})</a>
        <div className="space-y-1 max-h-[50vh] overflow-auto pr-1 mt-1">
          {filtered.map((g,i)=>{
            const active = g.label.toLowerCase()===nq;
            const href = `/${locale}/kategori/${basePath}?model=${encodeURIComponent(g.label)}`;
            return (
              <label key={g.label+i} className={`flex items-center gap-2 text-sm px-2 py-1 rounded ${active?'bg-accent/50':'hover:bg-accent/30'}`}>
                <input type="checkbox" readOnly checked={active} />
                <a href={href} className="flex-1">{g.label} ({g.count.toLocaleString('tr-TR')})</a>
              </label>
            );
          })}
          {filtered.length===0 && <div className="text-xs text-muted-foreground px-2 py-1">Sonuç yok</div>}
        </div>
      </div>
    </div>
  );
}


