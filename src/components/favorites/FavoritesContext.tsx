"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export type FavoriteItem = { id: string; title: string; brand?: string; image?: string; href: string };

type FavoritesContextType = {
  items: FavoriteItem[];
  add: (item: FavoriteItem) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  toggle: (item: FavoriteItem) => void;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("favorites:v1");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("favorites:v1", JSON.stringify(items)); } catch {}
  }, [items]);

  const api = useMemo<FavoritesContextType>(() => ({
    items,
    add: (item) => {
      setItems((prev) => {
        if (prev.find((x) => x.id === item.id)) { toast.info("Zaten favorilerde"); return prev; }
        toast.success("Favorilere eklendi");
        return [item, ...prev].slice(0, 30);
      });
    },
    remove: (id) => { toast.message("Favoriden çıkarıldı"); setItems((prev) => prev.filter((x) => x.id !== id)); },
    has: (id) => items.some((x) => x.id === id),
    toggle: (item) => {
      setItems((prev) => {
        const exists = prev.some((x) => x.id === item.id);
        if (exists) { toast.message("Favoriden çıkarıldı"); return prev.filter((x) => x.id !== item.id); }
        toast.success("Favorilere eklendi");
        return [item, ...prev].slice(0, 30);
      });
    }
  }), [items]);

  return <FavoritesContext.Provider value={api}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextType {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}


