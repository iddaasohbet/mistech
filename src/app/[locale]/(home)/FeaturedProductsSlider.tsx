"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import { buildImportedSlug, type ImportedItem } from "@/lib/imports-client";

type Props = {
  locale: string;
  items: ImportedItem[];
};

export default function FeaturedProductsSlider({ locale, items }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isHover, setIsHover] = useState(false);
  const [page, setPage] = useState(0);
  const visible = useMemo(() => items.slice(0, 5), [items]);

  useEffect(() => {
    const el = trackRef.current; if (!el) return;
    const id = setInterval(() => {
      if (!el || isHover) return;
      const card = el.firstElementChild as HTMLElement | null;
      const step = card ? card.clientWidth + 12 : Math.ceil(el.clientWidth / 5);
      if (Math.abs(el.scrollWidth - el.clientWidth - el.scrollLeft) <= step + 2) {
        el.scrollTo({ left: 0, behavior: "auto" });
        setPage(0);
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
        setPage((p)=> (p+1) % 2);
      }
    }, 2500);
    return () => clearInterval(id);
  }, [isHover]);

  const loopItems = [...visible, ...visible];

  function scrollToPage(target: number) {
    const el = trackRef.current; if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.clientWidth + 12 : Math.ceil(el.clientWidth / 5);
    el.scrollTo({ left: target * step * 5, behavior: "smooth" });
    setPage(target);
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Öne Çıkan Ürünler</h2>
        <a href={`/${locale}/urunler`} className="text-sm text-muted-foreground hover:text-foreground">Tümünü Gör →</a>
      </div>
      <div
        className="relative group"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <button type="button" aria-label="Prev" onClick={()=>scrollToPage(Math.max(0, page-1))}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 size-10 items-center justify-center rounded-full bg-white/70 backdrop-blur border border-white/60 ring-1 ring-black/10 text-foreground shadow-lg hover:bg-white transition opacity-0 group-hover:opacity-100">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button type="button" aria-label="Next" onClick={()=>scrollToPage(Math.min(1, page+1))}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 size-10 items-center justify-center rounded-full bg-white/70 backdrop-blur border border-white/60 ring-1 ring-black/10 text-foreground shadow-lg hover:bg-white transition opacity-0 group-hover:opacity-100">
          <ChevronRight className="w-5 h-5" />
        </button>
        <div ref={trackRef} className="flex overflow-x-auto no-scrollbar gap-3 md:gap-4 scroll-smooth">
          {loopItems.map((p, i) => (
            <div key={`${p.id}-${i}`} className="flex-none basis-1/2 md:basis-1/3 lg:basis-1/5">
              <ListingCard
                index={i}
                href={`/${locale}/urun/${buildImportedSlug(p)}`}
                title={p.title}
                brand={p.brand}
                price={p.price}
                image={p.image}
                badge={{ label: "Schnelle Lieferung" }}
                actions
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-2">
          {[0,1].map((i)=> (
            <button key={i} onClick={()=>scrollToPage(i)} aria-label={`Sayfa ${i+1}`}
              className={`h-2.5 w-2.5 rounded-full ring-1 transition ${page===i? 'bg-foreground ring-black/20' : 'bg-muted-foreground/30 ring-black/10 hover:bg-muted-foreground/50'}`}></button>
          ))}
        </div>
      </div>
    </section>
  );
}


