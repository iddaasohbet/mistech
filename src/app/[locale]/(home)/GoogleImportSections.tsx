import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildImportedSlug } from "@/lib/imports";
import BrandProductsSlider from "./BrandProductsSlider";

type ImportedItem = { id: string; title: string; brand?: string; price?: number; image?: string; url?: string };
type ImportedCategory = { category: string; url: string; items: ImportedItem[] };

async function loadGoogle(): Promise<ImportedCategory[]> { try{ const fp=path.join(process.cwd(),"public","data","google-import.json"); const raw=await readFile(fp,"utf8"); const data=JSON.parse(raw); if(Array.isArray(data)) return data as ImportedCategory[]; } catch{} return []; }

export default async function GoogleImportSections({ locale }: { locale: string }){
  const cats = await loadGoogle();
  const products: ImportedItem[]=[]; for(const c of cats){ for(const it of c.items){ if(!products.find(x=>x.id===it.id)) products.push(it); if(products.length>=12) break; } if(products.length>=12) break; }
  if(products.length===0) return null;
  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold">Google Ürünleri</h2></div>
      <BrandProductsSlider locale={locale} items={products.map(p=>({ id:p.id, slug:buildImportedSlug(p as any), title:p.title, brand:p.brand, price:p.price, image:p.image }))} />
    </section>
  );
}


