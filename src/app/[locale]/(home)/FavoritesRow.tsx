"use client";
import { useFavorites } from "@/components/favorites/FavoritesContext";
import ListingCard from "@/components/ListingCard";

export default function FavoritesRow({ locale }: { locale: string }) {
  const { items } = useFavorites();
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-6 pt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Favoriler</h2>
        <a href={`/${locale}/urunler`} className="text-sm text-muted-foreground hover:text-foreground">Tümünü Gör →</a>
      </div>
      <div className="flex overflow-x-auto no-scrollbar gap-3 md:gap-4">
        {items.slice(0, 10).map((it, i) => (
          <div key={it.id} className="flex-none basis-1/2 md:basis-1/3 lg:basis-1/5">
            <ListingCard
              index={i}
              href={it.href}
              title={it.title}
              brand={it.brand}
              image={it.image}
              actions
            />
          </div>
        ))}
      </div>
    </section>
  );
}


