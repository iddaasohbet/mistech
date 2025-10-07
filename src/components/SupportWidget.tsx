"use client";
import { useState } from "react";
import { X, Headset } from "lucide-react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path fill="#25D366" d="M16 3C9.373 3 4 8.373 4 15c0 2.092.53 4.064 1.462 5.798L4 29l8.4-1.41A11.87 11.87 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3z"/>
      <path fill="#fff" d="M12.83 10.59c-.24-.52-.49-.53-.72-.54l-.61-.01c-.21 0-.54.08-.82.39-.28.3-1.07 1.04-1.07 2.54s1.1 2.95 1.25 3.15c.16.21 2.11 3.37 5.18 4.59 2.56 1.01 3.08.81 3.64.76.56-.05 1.79-.73 2.04-1.44.25-.71.25-1.32.18-1.44-.07-.12-.27-.2-.56-.35-.29-.16-1.79-.88-2.07-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.18.2-.35.22-.64.07-.29-.15-1.21-.45-2.31-1.43-.86-.76-1.44-1.7-1.61-1.99-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.63-1.55-.86-2.11z"/>
    </svg>
  );
}

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const whatsapp = "+4915164841342";
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 w-[320px] rounded-xl border bg-card/95 backdrop-blur shadow-[0_10px_30px_rgba(0,0,0,.15)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white">
            <div className="text-sm font-semibold">Mistech.de • Kundendienst</div>
            <button aria-label="Kapat" onClick={() => setOpen(false)} className="rounded hover:bg-white/10 p-1">
              <X className="size-4" />
            </button>
          </div>
          <div className="p-4 text-sm">
            <div className="text-muted-foreground">Erreichbar Mo–Fr • 10:00–18:00</div>
            <div className="mt-3 grid grid-cols-[40px_1fr_auto] gap-3 items-center">
              <div className="size-10 rounded-full bg-green-100 flex items-center justify-center">
                <WhatsAppIcon className="size-6" />
              </div>
              <div>
                <div className="text-foreground font-medium">WhatsApp Support</div>
                <div className="text-xs text-muted-foreground">Antwort in der Regel in 5–15 Min.</div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px]">Online</span>
            </div>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center justify-center rounded-md bg-green-500 hover:bg-green-600 transition-colors px-3 py-2 text-white w-full"
            >
              Jetzt chatten
            </a>
          </div>
        </div>
      )}
      <button
        aria-label="Canlı destek"
        onClick={() => setOpen(!open)}
        className="inline-flex size-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg ring-1 ring-black/10 hover:scale-105 transition-transform"
      >
        <WhatsAppIcon className="size-6" />
      </button>
    </div>
  );
}


