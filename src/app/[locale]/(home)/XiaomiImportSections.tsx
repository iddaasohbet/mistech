import Image from "next/image";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildImportedSlug } from "@/lib/imports";
import BrandProductsSlider from "./BrandProductsSlider";

type ImportedItem = { id: string; title: string; brand?: string; price?: number; image?: string; url?: string };
type ImportedCategory = { category: string; url: string; items: ImportedItem[] };

async function loadXiaomi(): Promise<ImportedCategory[]> {
  try { const fp=path.join(process.cwd(),"public","data","xiaomi-import.json"); const raw=await readFile(fp,"utf8"); const data=JSON.parse(raw); if(Array.isArray(data)) return data as ImportedCategory[]; } catch{} return []; }

function labelFromUrl(u: string){ try{ const url=new URL(u); const parts=url.pathname.split("/").filter(Boolean); const last=parts.pop()||""; const label=decodeURIComponent(last).replace(/[-_]/g," ").trim(); if(!label || label.toLowerCase()==="xiaomi" || label.toLowerCase()==="parts"){ const prev=parts.pop()||label; return decodeURIComponent(prev).replace(/[-_]/g," ").trim(); } return label; } catch{ return "Kategori"; } }

function groups(cats: ImportedCategory[]){ const m=new Map<string,{label:string,ids:Set<string>}>(); for(const c of cats){ if(!c.items||c.items.length===0) continue; const lab=labelFromUrl(c.url); const k=lab.toLowerCase(); if(!m.has(k)) m.set(k,{label:lab,ids:new Set<string>()}); const g=m.get(k)!; for(const it of c.items) if(it?.id) g.ids.add(it.id); } return Array.from(m.values()).map(g=>({label:g.label,count:g.ids.size})).sort((a,b)=>b.count-a.count); }

export default async function XiaomiImportSections({ locale }: { locale: string }) {
  const cats = await loadXiaomi();
  const gs = groups(cats).slice(0, 24);
  const products: ImportedItem[] = [];
  for (const c of cats) {
    for (const it of c.items) { if (!products.find(x=>x.id===it.id)) products.push(it); if (products.length>=12) break; }
    if (products.length>=12) break;
  }
  return (
    <div>
      {/* Category strip removed as requested */}
      {products.length>0 && (
        <section className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold">Xiaomi Ürünleri</h2></div>
          <BrandProductsSlider
            locale={locale}
            items={products.map((p)=>({ id:p.id, slug:buildImportedSlug(p as any), title:p.title, brand:p.brand, price:p.price, image:p.image }))}
          />
        </section>
      )}
    </div>
  );
}


