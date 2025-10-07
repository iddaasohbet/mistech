"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth);
      setIndex(i);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const go = (i: number) => {
    const el = trackRef.current; if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setIndex(i);
  };

  const imgs = images && images.length > 0 ? images : ["/next.svg"];

  return (
    <div className="w-full">
      <div ref={trackRef} className="relative w-full overflow-x-auto scroll-smooth no-scrollbar">
        <div className="flex snap-x snap-mandatory">
          {imgs.map((src, i) => (
            <div key={i} className="relative min-w-full snap-center aspect-square rounded-lg border overflow-hidden p-2 md:p-6 bg-neutral-100">
              <Image src={src} alt={`${title} ${i + 1}`} fill className="object-contain mix-blend-darken" sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
        {imgs.slice(0, 8).map((src, i) => (
          <button key={i} onClick={() => go(i)} className={`relative aspect-square w-16 rounded border overflow-hidden p-1 bg-neutral-100 ${i === index ? "ring-2 ring-primary" : ""}`} aria-label={`Küçük görsel ${i + 1}`}>
            <Image src={src} alt={`${title} küçük ${i + 1}`} fill className="object-contain mix-blend-darken" sizes="64px" />
          </button>
        ))}
      </div>
    </div>
  );
}


