"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

type Testimonial = {
  id: string;
  author: string;
  city: string;
  content: string;
  rating: number;
};

function hashStringToInt(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    hash = ch + (hash << 6) + (hash << 16) - hash;
    hash |= 0;
  }
  return Math.abs(hash);
}

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T { return arr[Math.floor(rng() * arr.length)]; }

function generateTestimonials(seed: string, count = 8): Testimonial[] {
  const namesFirst = ["Ahmet","Mehmet","Ayşe","Fatma","Emre","Can","Zeynep","Elif","Burak","Ece","Mert","Deniz","Cem","Berk","Gizem","Nil","Selin","Kerem","Onur","Seda"];
  const namesLast = ["Yılmaz","Demir","Kaya","Şahin","Çelik","Yıldız","Aydın","Polat","Keskin","Arslan","Koç","Öztürk","Kurt","Doğan","Bulut","Bozkurt","Aksoy","Korkmaz","Özdemir","Erdoğan"];
  const cities = ["İstanbul","Ankara","İzmir","Bursa","Antalya","Adana","Konya","Kocaeli","Gaziantep","Mersin","Eskişehir","Samsun","Trabzon","Kayseri"];
  const comments = [
    "Ürün kalitesi çok iyi, paketleme özenliydi. Hızlı kargo için teşekkürler.",
    "Fiyat/performans olarak gayet başarılı buldum, tavsiye ederim.",
    "Uyumluluk sorunsuz oldu, açıklamalar yeterliydi.",
    "Satıcı ilgili, sorularıma hızlı dönüş aldım. Memnun kaldım.",
    "Beklediğimden daha iyi çıktı. Bir süredir kullanıyorum, sıkıntı yok.",
    "Orijinal ürün, güvenle alışveriş yapılır.",
    "Kargoda küçük gecikme oldu ama ürün sorunsuz geldi.",
    "Malzeme kalitesi ve işçilik gayet iyi, fiyatını hak ediyor.",
  ];

  const rng = mulberry32(hashStringToInt(seed));
  const n = Math.max(5, Math.min(12, Math.floor(rng() * count) + count));
  const arr: Testimonial[] = [];
  for (let i = 0; i < n; i++) {
    const author = `${pick(rng, namesFirst)} ${pick(rng, namesLast)}`;
    const city = pick(rng, cities);
    const content = pick(rng, comments);
    const rSeed = rng();
    const rating = rSeed > 0.75 ? 4 : 5; // çoğunlukla 5, bazen 4
    arr.push({ id: `${seed}-${i}`, author, city, content, rating });
  }
  return arr;
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={i < value ? "#f5b301" : "none"} stroke={i < value ? "#f5b301" : "currentColor"} strokeWidth="2" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.56a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.482 20.497a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.56a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ))}
    </div>
  );
}

function maskSurname(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return fullName;
  const last = parts.pop() as string;
  const keep = Math.min(2, Math.max(1, last.length - 1));
  const masked = last.slice(0, keep) + "*".repeat(Math.max(1, last.length - keep));
  return [...parts, masked].join(" ");
}

export default function HomeTestimonials({ seed = "global" }: { seed?: string }) {
  const items = useMemo(() => generateTestimonials(seed + "-testimonials", 12), [seed]);
  const [index, setIndex] = useState(0); // item-based index
  const [perView, setPerView] = useState(1);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef<number | null>(null);

  useEffect(() => {
    const compute = () => {
      if (typeof window === "undefined") return;
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setPerView(3);
      } else if (window.matchMedia("(min-width: 640px)").matches) {
        setPerView(2);
      } else {
        setPerView(1);
      }
    };
    compute();
    const onResize = () => compute();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const maxIndex = Math.max(0, items.length - perView);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % (maxIndex + 1));
    }, 4500);
    return () => clearInterval(id);
  }, [maxIndex, paused]);

  // Translate by one card width each step; cards have fixed flex-basis 100/perView
  const offsetPercent = index * (100 / perView);

  function goNext() {
    setIndex((i) => (i + 1) % (maxIndex + 1));
  }
  function goPrev() {
    setIndex((i) => (i - 1 + (maxIndex + 1)) % (maxIndex + 1));
  }

  function onPointerDown(e: React.PointerEvent) {
    startXRef.current = e.clientX;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }
  function onPointerUp(e: React.PointerEvent) {
    if (startXRef.current == null) return;
    const dx = e.clientX - startXRef.current;
    startXRef.current = null;
    const threshold = 40; // px
    if (Math.abs(dx) > threshold) {
      if (dx < 0) goNext();
      else goPrev();
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-10" aria-label="Müşteri Yorumları">
      <h2 className="text-xl md:text-2xl font-semibold mb-4">Müşteri Yorumları</h2>
      <div
        className="group relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          className="flex transition-transform duration-500 ease-out select-none"
          style={{ transform: `translateX(-${offsetPercent}%)` }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {items.map((t) => (
            <div
              key={t.id}
              className="shrink-0 px-2 md:px-3 py-2 md:py-3"
              style={{ flex: `0 0 ${100 / perView}%`, maxWidth: `${100 / perView}%` }}
            >
              <div className="flex h-full flex-col gap-2 rounded-lg border bg-card p-5 md:p-6 shadow-sm">
                <Stars value={t.rating} />
                <p className="text-sm md:text-base text-foreground/90 leading-relaxed">{t.content}</p>
                <div className="mt-auto text-sm text-muted-foreground">{maskSurname(t.author)}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Önceki"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full border bg-background/80 backdrop-blur px-2.5 py-2 shadow hover:bg-background opacity-0 transition-opacity group-hover:opacity-100"
          onClick={goPrev}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Sonraki"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full border bg-background/80 backdrop-blur px-2.5 py-2 shadow hover:bg-background opacity-0 transition-opacity group-hover:opacity-100"
          onClick={goNext}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />

        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              className={clsx("h-1.5 w-5 rounded-full transition-colors", i === index ? "bg-foreground" : "bg-muted-foreground/40")}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}


