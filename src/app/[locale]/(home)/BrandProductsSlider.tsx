"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Card = { id: string; slug: string; title: string; brand?: string; price?: number; image?: string };

export default function BrandProductsSlider({ items, locale }: { items: Card[]; locale: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const el = trackRef.current; if (!el) return;
    const calc = () => {
      const perView = Math.max(1, Math.floor(el.clientWidth / 220));
      setTotalPages(Math.max(1, Math.ceil((items.length || 0) / perView)));
    };
    calc();
    const ro = new ResizeObserver(calc); ro.observe(el);
    return () => ro.disconnect();
  }, [items]);

  useEffect(() => {
    const el = trackRef.current; if (!el || totalPages <= 1) return;
    const t = setInterval(() => {
      const next = (page + 1) % totalPages;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
      setPage(next);
    }, 2600);
    return () => clearInterval(t);
  }, [page, totalPages]);

  return (
    <div ref={trackRef} className="overflow-x-hidden">
      <div className="grid auto-cols-[200px] md:auto-cols-[220px] grid-flow-col gap-3">
        {items.map((p, i) => (
          <a key={p.id} href={`/${locale}/urun/${p.slug}`} className="block">
            <div className="relative border rounded-md overflow-hidden h-full">
              <div className={`absolute inset-0 bg-gradient-to-br ${i % 2 === 0 ? 'from-primary/10' : 'from-amber-500/10'} to-transparent pointer-events-none`} />
              <div className="relative z-10">
                <div className="relative aspect-[4/5] md:aspect-[3/4] bg-neutral-100">
                  <Image src={p.image || "/next.svg"} alt={p.title} fill className="object-cover md:object-contain md:p-4 mix-blend-darken" />
                </div>
                <div className="p-2">
                  {p.brand && <div className="text-sm text-muted-foreground">{p.brand}</div>}
                  <div className="text-sm font-medium line-clamp-2 min-h-[40px]">{p.title}</div>
                  {typeof p.price === 'number' && (
                    <div className="mt-1 font-semibold text-sm">€ {(p.price / 100).toLocaleString('de-DE')}</div>
                  )}
                </div>
              </div>
              <div className="absolute top-0 right-0 z-20 px-2 py-0.5 text-[10px] md:text-xs bg-black/70 text-white rounded-bl">
                MisTech
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


