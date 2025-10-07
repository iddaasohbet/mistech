import ListingCard from "@/components/ListingCard";
import Pagination from "@/components/Pagination";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildImportedSlug } from "@/lib/imports";

type ImportedItem = { id: string; title: string; brand?: string; price?: number; image?: string; url?: string };
type ImportedCategory = { category: string; url: string; items: ImportedItem[] };

async function loadOneplus(): Promise<ImportedCategory[]> { try{ const fp=path.join(process.cwd(),"public","data","oneplus-import.json"); const raw=await readFile(fp,"utf8"); const data=JSON.parse(raw); if(Array.isArray(data)) return data as ImportedCategory[]; } catch{} return []; }
function labelFromUrl(u: string){ try{ const url=new URL(u); const parts=url.pathname.split("/").filter(Boolean); const last=parts.pop()||""; const label=decodeURIComponent(last).replace(/[-_]/g," ").trim(); if(!label||label.toLowerCase()==="oneplus"||label.toLowerCase()==="parts"){ const prev=parts.pop()||label; return decodeURIComponent(prev).replace(/[-_]/g," ").trim(); } return label; } catch{ return ""; } }
function normalize(x:string){ return x.toLowerCase().replace(/\s+/g," ").trim(); }
function buildGroups(cats: ImportedCategory[]){ const m=new Map<string,{label:string; ids:Set<string>}>(); for(const c of cats){ if(!c.items||c.items.length===0) continue; const lab=labelFromUrl(c.url); const k=lab.toLowerCase(); if(!m.has(k)) m.set(k,{label:lab,ids:new Set<string>()}); const g=m.get(k)!; for(const it of c.items) if(it?.id) g.ids.add(it.id); } return Array.from(m.values()).map(g=>({label:g.label,count:g.ids.size})).sort((a,b)=>b.count-a.count); }

export default async function OneplusCategoryPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams?: Promise<{ model?: string; page?: string }> }){
  const { locale } = await params;
  const s = (await (searchParams ?? Promise.resolve({} as any))) as { model?: string; page?: string };
  const catsAll=(await loadOneplus()).filter(c=>(c.items?.length??0)>0);
  const groups=buildGroups(catsAll);
  const ids=new Set<string>(); for(const c of catsAll) for(const it of c.items) if(it?.id) ids.add(it.id);
  const allTotal=ids.size; const model=s?.model?decodeURIComponent(s.model):""; const nq=normalize(model);
  const pageNum=Math.max(1, parseInt(String(s?.page??"1"),10) || 1); const pageSize=24;
  const cats=nq? catsAll.filter(c=>normalize(labelFromUrl(c.url)).includes(nq)) : catsAll;
  const products: ImportedItem[]=[]; for(const c of cats) for(const it of c.items) if(!products.find(x=>x.id===it.id)) products.push(it);
  const total=products.length; const totalPages=Math.max(1, Math.ceil(total/pageSize)); const slice=products.slice((pageNum-1)*pageSize, pageNum*pageSize);
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-10">
      <div className="mb-6"><h1 className="text-2xl font-semibold">{model?`OnePlus Kategorisi – ${model}`:"OnePlus Kategorisi"}</h1><p className="text-sm text-muted-foreground">Alt kategoriler ve ithal ürünler</p></div>
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1"><div className="rounded-md border p-3"><div className="font-medium mb-2">Alt Kategoriler</div><div className="space-y-1 max-h-[70vh] overflow-auto pr-1">
          <a href={`/${locale}/kategori/oneplus`} className={`block text-sm px-2 py-1 rounded ${!nq?'bg-accent/50':'hover:bg-accent/30'}`}>Tümü ({allTotal.toLocaleString('tr-TR')})</a>
          {groups.map((g,i)=>{ const active=normalize(g.label)===nq; const href=`/${locale}/kategori/oneplus?model=${encodeURIComponent(g.label)}`; return (<a key={g.label+i} href={href} className={`block text-sm px-2 py-1 rounded ${active?'bg-accent/50':'hover:bg-accent/30'}`}>{g.label} ({g.count.toLocaleString('tr-TR')})</a>); })}
        </div></div></aside>
        <div className="lg:col-span-3">
          <h2 className="text-lg font-semibold mb-3">Ürünler {total?`(${total.toLocaleString('tr-TR')})`:''}</h2>
          {slice.length===0? (<div className="text-sm text-muted-foreground">Ürün bulunamadı.</div>) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {slice.map((p,i)=>{ const slug=buildImportedSlug(p as any); return (
                <ListingCard key={p.id} index={i} href={`/${locale}/urun/${slug}`} title={p.title} brand={p.brand} price={p.price} image={p.image} badge={{ label: "Schnelle Lieferung" }} actions />
              ); })}
            </div>
          )}
          {totalPages>1 && (<Pagination current={pageNum} total={totalPages} makeHref={(p)=>`/${locale}/kategori/oneplus?${new URLSearchParams({ ...(nq?{model:model}:{}), page:String(p)}).toString()}`} />)}
        </div>
      </div>
    </div>
  );
}


