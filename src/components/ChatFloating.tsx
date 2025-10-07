"use client";
import { MessageCircle } from "lucide-react";

export default function ChatFloating() {
  return (
    <a
      href="https://wa.me/4915164841342"
      target="_blank"
      aria-label="Canlı Destek"
      className="fixed bottom-4 right-4 z-50 md:hidden inline-flex items-center gap-2 rounded-full border bg-background px-3 py-2 shadow-lg"
    >
      <span className="relative inline-flex">
        <span className="absolute -left-1 -top-1 size-2 rounded-full bg-green-500 animate-ping" />
        <span className="size-2 rounded-full bg-green-500" />
      </span>
      <MessageCircle className="size-5" />
      <span className="text-sm">Canlı Destek</span>
    </a>
  );
}


