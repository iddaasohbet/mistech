import ListingCard from "@/components/ListingCard";
import { loadAllImports, buildImportedSlug } from "@/lib/imports";
import { enrichPricesForItems } from "@/lib/price-enrich";
import Pagination from "@/components/Pagination";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function labelFromUrl(u: string): string {
  try { const url=new URL(u); const parts=url.pathname.split('/').filter(Boolean); const last=parts.pop()||""; const label=decodeURIComponent(last).replace(/[-_]/g,' ').trim(); if(!label||label==="parts"){ const prev=parts.pop()||label; return decodeURIComponent(prev).replace(/[-_]/g,' ').trim(); } return label; } catch { return ""; }
}

export default async function AllProductsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams?: Promise<{ q?: string; page?: string }> }) {
  const { locale } = await params;
  const sp = await (searchParams ?? Promise.resolve({} as any));
  const q = sp?.q?.toLowerCase?.() || "";
  const pageNum = Math.max(1, parseInt(String(sp?.page ?? "1"), 10) || 1);
  const pageSize = 30;
  const all = await loadAllImports();
  const pool: { id: string; title: string; brand?: string; price?: number; image?: string }[] = [];
  for (const { categories } of all) {
    for (const c of categories) for (const it of c.items || []) if (!pool.find(x=>x.id===it.id)) pool.push(it);
  }
  // deterministic order for paging
  const filtered = (q ? pool.filter(p=> p.title.toLowerCase().includes(q) || (p.brand||"").toLowerCase().includes(q)) : pool)
    .sort((a,b)=> (a.title||"").localeCompare(b.title||""));
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const selected = await enrichPricesForItems(filtered.slice((pageNum-1)*pageSize, pageNum*pageSize));
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-10">
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <aside>
          <div className="rounded-md border p-3 space-y-4">
            <div className="font-medium">Filtreler</div>
            <form className="flex gap-2" action={`/${locale}/urunler`}>
              <input name="q" defaultValue={q} placeholder="Ürün veya marka ara" className="h-9 px-3 rounded-md border w-full" />
              <button className="h-9 px-3 rounded-md border">Ara</button>
            </form>
            <div className="text-xs text-muted-foreground">Toplam {filtered.length.toLocaleString('tr-TR')} ürün</div>
            <div className="pt-2">
              <div className="font-medium mb-1">Kategoriler</div>
              <Accordion type="multiple" className="w-full">
                {all.map(({ source, categories }) => {
                  const label = source[0].toUpperCase()+source.slice(1);
                  // derive sub-groups from urls
                  const groups = new Map<string, number>();
                  for (const c of categories) {
                    const l = labelFromUrl(c.url); if(!l) continue; const k=l.toLowerCase(); groups.set(l, (groups.get(l)||0) + (c.items?.length||0));
                  }
                  const items = Array.from(groups.entries()).sort((a,b)=> b[1]-a[1]).slice(0,12);
                  return (
                    <AccordionItem key={source} value={source}>
                      <AccordionTrigger className="text-sm">{label}</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1 text-sm max-h-56 overflow-auto pr-1">
                          <li><a className="block px-2 py-1 rounded hover:bg-accent/50" href={`/${locale}/kategori/${source}`}>Tümü</a></li>
                          {items.map(([name])=> (
                            <li key={name}><a className="block px-2 py-1 rounded hover:bg-accent/50" href={`/${locale}/kategori/${source}?model=${encodeURIComponent(name)}`}>{name}</a></li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </div>
        </aside>
        <section>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {selected.map((p,i)=> (
              <ListingCard
                key={p.id}
                index={i}
                href={`/${locale}/urun/${buildImportedSlug(p as any)}`}
                title={p.title}
                brand={p.brand}
                price={p.price}
                image={p.image}
                badge={{ label: "Schnelle Lieferung" }}
                actions
              />
            ))}
          </div>
          {totalPages>1 && (
            <Pagination current={pageNum} total={totalPages} makeHref={(p)=>`/${locale}/urunler?${new URLSearchParams({ ...(q?{q}:{}), page:String(p)}).toString()}`} />
          )}
        </section>
      </div>
    </div>
  );
}


