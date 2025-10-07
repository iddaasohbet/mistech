"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Item = {
  id: string;
  title: string;
  brand?: string;
  price?: number;
  images?: string[];
};

function Strip({ title, src }: { title: string; src: string }) {
  const [items, setItems] = useState<Item[] | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch(src, { cache: "no-store" });
        if (!alive) return;
        if (r.ok) {
          const data = (await r.json()) as Item[];
          setItems(Array.isArray(data) ? data : []);
        } else {
          setItems([]);
        }
      } catch {
        setItems([]);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [src]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const calc = () => {
      const perView = Math.max(1, Math.floor(el.clientWidth / 200));
      const pages = Math.max(1, Math.ceil(((items?.length ?? 0) || 0) / perView));
      setTotalPages(pages);
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || totalPages <= 1) return;
    const id = setInterval(() => {
      const next = (page + 1) % totalPages;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
      setPage(next);
    }, 2500);
    return () => clearInterval(id);
  }, [page, totalPages]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === page ? "bg-foreground" : "bg-muted-foreground/40"}`} />
          ))}
        </div>
      </div>
      {!items && (
        <div className="h-[180px] grid place-items-center text-sm text-muted-foreground border rounded-md">Yükleniyor...</div>
      )}
      {items && items.length === 0 && (
        <div className="h-[180px] grid place-items-center text-sm text-muted-foreground border rounded-md">Bu bölüm için ürün yok.</div>
      )}
      {items && items.length > 0 && (
        <div ref={trackRef} className="overflow-x-hidden">
          <div className="grid auto-cols-[200px] md:auto-cols-[240px] grid-flow-col gap-3">
            {items.map((p, i) => {
              const img = p.images?.[0] || "/next.svg";
              return (
                <div key={p.id} className="relative border rounded-md overflow-hidden h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${i % 2 === 0 ? "from-primary/10" : "from-amber-500/10"} to-transparent pointer-events-none`} />
                  <div className="relative z-10">
                    <div className="relative aspect-[4/5] md:aspect-[3/4]">
                      <Image src={img} alt={p.title} fill className="object-cover md:object-contain md:p-4" />
                    </div>
                    <div className="p-2">
                      {p.brand && <div className="text-sm text-muted-foreground h-4 truncate">{p.brand}</div>}
                      <div className="text-sm font-medium line-clamp-2 min-h-[40px]">{p.title}</div>
                      {typeof p.price === "number" && (
                        <div className="mt-1 font-semibold text-sm">₺ {(p.price / 100).toLocaleString("tr-TR")}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default function ExternalProductsSliders() { return null }


