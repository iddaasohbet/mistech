"use client";
import { usePathname } from "next/navigation";

const FLAGS: Record<string, string> = { tr: "🇹🇷", en: "🇬🇧", de: "🇩🇪" };

export default function LangSwitcher({ current }: { current: string }) {
  const pathname = usePathname() || "/tr";
  function swapLocale(next: string) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return `/${next}`;
    parts[0] = next;
    return `/${parts.join("/")}`;
  }
  return (
    <div className="relative">
      <details className="group">
        <summary className="list-none inline-flex items-center justify-center size-8 rounded border bg-background cursor-pointer" aria-label="Dil seçimi">
          <span className="text-base leading-none">{FLAGS[current] ?? "🌐"}</span>
        </summary>
        <div className="absolute right-0 top-full mt-2 z-50 w-36 rounded-md border bg-popover p-1 text-sm shadow-lg">
          {(["tr","en","de"] as const).map((l) => (
            <a key={l} href={swapLocale(l)} className={`block rounded px-2 py-1 hover:bg-accent ${current===l?"text-foreground":"text-muted-foreground"}`}>{l.toUpperCase()}</a>
          ))}
        </div>
      </details>
    </div>
  );
}


