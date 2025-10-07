"use client";
import Image from "next/image";
import { Heart, ArrowRight } from "lucide-react";
import { useFavorites } from "@/components/favorites/FavoritesContext";

export default function ListingCard({ href, title, brand, price, image, index, badge, actions }: { href: string; title: string; brand?: string; price?: number; image?: string; index?: number; badge?: { label: string }; actions?: boolean }) {
  const even = (index ?? 0) % 2 === 0;
  const fav = useFavorites();
  const idForFav = href; // simple unique key from href
  const isFav = fav.has(idForFav);
  return (
    <div className="relative h-full group/card">
      <a href={href} className="block">
        <div className="relative rounded-2xl overflow-hidden h-full min-h-[360px] border border-black/5 dark:border-white/10">
          <div className={`absolute inset-0 bg-gradient-to-br ${even ? 'from-primary/10' : 'from-amber-500/10'} to-transparent pointer-events-none`} />
          <div className="relative z-10">
            <div className="relative aspect-[4/5] md:aspect-[3/4] bg-neutral-100">
              {image && (
                <Image src={image} alt={title} fill className="object-cover md:object-contain md:p-4 mix-blend-darken" />
              )}
            </div>
            <div className="p-2">
              <div className="h-5 text-sm text-muted-foreground">{brand || '\u00A0'}</div>
              <div className="text-sm font-medium line-clamp-2 min-h-[40px]">{title}</div>
            </div>
          </div>
          {actions && (
            <div className="absolute inset-0 z-30 opacity-0 group-hover/card:opacity-100 transition pointer-events-none">
              <div className="absolute top-10 right-2 flex flex-col items-center gap-2 translate-x-3 group-hover/card:translate-x-0 transition pointer-events-auto">
                <button
                  aria-label="Favori Ekle"
                  title={isFav ? "Favoriden çıkar" : "Favori Ekle"}
                  onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); fav.toggle({ id: idForFav, title, brand, image, href }); }}
                  className="size-10 rounded-full bg-white/80 backdrop-blur border border-white/60 ring-1 ring-black/10 text-foreground shadow-md hover:bg-white flex items-center justify-center"
                >
                  {isFav ? <Heart className="w-4 h-4 fill-red-500 text-red-500" /> : <Heart className="w-4 h-4" />}
                </button>
                <button
                  onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); window.location.href = href; }}
                  aria-label="Ürüne Git"
                  title="Ürüne Git"
                  className="size-10 rounded-full bg-white/80 backdrop-blur border border-white/60 ring-1 ring-black/10 text-foreground shadow-md hover:bg-white flex items-center justify-center"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          {badge?.label && (
            <div className="absolute top-2 right-2 z-20">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500 text-white px-2 py-1 text-[10px] font-semibold shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3H5a2 2 0 0 1-2-2V7z"/></svg>
                {badge.label}
              </span>
            </div>
          )}
          <div className="absolute top-1 left-1 z-20">
            <img src="https://hizliresimle.com/i/i68e13e6f862eb" alt="logo" className="h-6 md:h-7 w-auto" loading="lazy" decoding="async" />
          </div>
        </div>
      </a>
      {/* quantity/cart controls removed */}
    </div>
  );
}


