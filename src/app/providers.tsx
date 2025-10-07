"use client";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { FavoritesProvider } from "@/components/favorites/FavoritesContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <FavoritesProvider>
        {children}
      </FavoritesProvider>
      <Toaster position="top-right" richColors />
    </SessionProvider>
  );
}


