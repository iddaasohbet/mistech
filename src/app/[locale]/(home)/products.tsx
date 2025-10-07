"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
// unify product card visuals with product detail "Similar" slider
import { Locale } from "../../i18n";

export default function ProductsSection({ locale }: { locale: Locale }) {
  const [products, setProducts] = useState<any[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const r1 = await fetch("/data/products.json", { cache: "no-store" });
        if (r1.ok) {
          const list = await r1.json();
          setProducts(list || []);
          return;
        }
      } catch {}
      try {
        const res = await fetch("/api/home-products", { cache: "no-store" });
        const data = await res.json();
        setProducts(data.products || []);
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const calc = () => {
      const perView = Math.max(1, Math.floor(el.clientWidth / 180));
      const pages = Math.max(1, Math.ceil((products.length || 0) / perView));
      setTotalPages(pages);
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [products]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || totalPages <= 1) return;
    const interval = setInterval(() => {
      const next = (page + 1) % totalPages;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
      setPage(next);
    }, 2500);
    return () => clearInterval(interval);
  }, [page, totalPages]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Öne Çıkan Ürünler</h2>
        <a
          href={`/${locale}/kategori/telefonlar`}
          className="text-sm text-muted-foreground hover:underline"
        >
          Tümünü gör
        </a>
      </div>
      <div ref={trackRef} className="overflow-x-hidden">
        <div className="grid auto-cols-[180px] md:auto-cols-[220px] grid-flow-col gap-3">
        {products.map((p, i) => {
          const imgs = (p.images as unknown as string[]) || [];
          return (
            <a key={p.id} href={`/${locale}/urun/${p.slug}`}>
              <div className="relative border rounded-md overflow-hidden h-full">
                <div className={`absolute inset-0 bg-gradient-to-br ${i % 2 === 0 ? "from-primary/10" : "from-amber-500/10"} to-transparent pointer-events-none`} />
                <div className="relative z-10">
                  <div className="relative aspect-[4/5] md:aspect-[3/4]">
                    <Image
                      src={imgs[0] || "/next.svg"}
                      alt={p.title}
                      fill
                      className="object-cover md:object-contain md:p-4 mix-blend-darken"
                    />
                  </div>
                  <div className="p-2">
                    <div className="text-sm text-muted-foreground">{p.brand}</div>
                    <div className="text-sm font-medium line-clamp-2">{p.title}</div>
                    {typeof p.price === "number" && (
                      <div className="mt-1 font-semibold text-sm">₺ {(p.price / 100).toLocaleString("tr-TR")}</div>
                    )}
                  </div>
                </div>
                <div className="absolute top-0 right-0 z-20 px-2 py-0.5 text-[10px] md:text-xs bg-black/70 text-white rounded-bl">MisTech</div>
              </div>
            </a>
          );
        })}
        </div>
      </div>
      {totalPages > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === page ? "bg-foreground" : "bg-muted-foreground/40"}`} />
          ))}
        </div>
      )}
    </section>
  );
}


