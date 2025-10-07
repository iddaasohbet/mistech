"use client";
import { useEffect, useRef, useState } from "react";
import ListingCard from "@/components/ListingCard";

type P = {
  id: string;
  slug: string;
  title: string;
  brand?: string;
  price?: number;
  images: string[];
};

export default function SimilarSlider({ products, locale }: { products: P[]; locale: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const calc = () => {
      // Mobile: 1 kart, Desktop: 3-4 karta göre hesapla
      const perView = el.clientWidth < 768 ? 1 : Math.max(1, Math.floor(el.clientWidth / 220));
      setTotalPages(Math.max(1, Math.ceil(products.length / perView)));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [products]);

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
    <div>
      <div ref={trackRef} className="overflow-x-hidden">
        <div className="grid auto-cols-[100%] md:auto-cols-[240px] grid-flow-col gap-0 md:gap-3">
          {products.map((p, i) => (
            <div key={p.id} className="block">
              <ListingCard
                index={i}
                href={`/${locale}/urun/${p.slug}`}
                title={p.title}
                brand={p.brand}
                price={p.price}
                image={p.images?.[0]}
                badge={{ label: "Schnelle Lieferung" }}
                actions
              />
            </div>
          ))}
        </div>
      </div>
      {totalPages > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === page ? "bg-foreground" : "bg-muted-foreground/40"}`} />
          ))}
        </div>
      )}
    </div>
  );
}


