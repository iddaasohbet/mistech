"use client";

export default function HotProducts({ items, locale }: { items: { id:string; title:string; slug:string; brand:string; price:number; image?:string|null; count:number }[]; locale: string }){
  if(!items || items.length===0) return null;
  return (
    <div className="rounded-lg border p-4">
      <div className="font-medium mb-4">Son 7 Gün – Öne Çıkan Ürünler</div>
      <div className="grid md:grid-cols-2 gap-3">
        {items.map((p)=> (
          <a key={p.id} href={`/${locale}/urun/${p.slug}`} className="flex items-center gap-3 rounded-md border p-2 hover:bg-accent/50 transition-colors">
            <div className="size-12 rounded bg-muted overflow-hidden flex items-center justify-center">
              {p.image ? <img src={p.image} alt={p.title} className="object-cover w-full h-full"/> : <div className="text-xs text-muted-foreground">No Image</div>}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{p.title}</div>
              <div className="text-xs text-muted-foreground">{p.brand} • {p.count} adet • {(p.price/100).toLocaleString('tr-TR')} ₺</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}




















