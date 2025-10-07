"use client";
import ThemeToggle from "./ThemeToggle";
import LangSwitcher from "./LangSwitcher";
import { MessageCircleMore } from "lucide-react";

export default function TopBar({ locale }: { locale: string }) {
  return (
    <div className="w-full border-b bg-muted/40 text-xs">
      <div className="mx-auto max-w-7xl px-4 md:px-6 h-9 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex items-center gap-2 px-2 py-1 rounded border bg-background">
            <span className="absolute left-1 top-1 size-2 rounded-full bg-green-500 animate-pulse" />
            <MessageCircleMore className="size-3.5" />
            <a href="https://wa.me/4915164841342" target="_blank" className="hover:underline">Canlı Destek</a>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LangSwitcher current={locale} />
        </div>
      </div>
    </div>
  );
}


