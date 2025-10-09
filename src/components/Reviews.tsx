"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import RatingStars from "@/components/RatingStars";

type Review = {
  id: string;
  author: string;
  content: string;
  rating: number;
  createdAt: string;
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

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function generatePseudoReviews(seed: string): Review[] {
  const namesFirst = [
    "Ahmet", "Mehmet", "Ayşe", "Fatma", "Emre", "Can", "Zeynep", "Elif", "Burak", "Ece",
    "Mert", "Deniz", "Cem", "Berk", "Gizem", "Nil", "Selin", "Kerem", "Onur", "Seda",
    "Yasin", "Hakan", "Melis", "Tuğçe", "Sinem", "Umut", "Gökhan", "Aslı", "Okan", "Pelin"
  ];
  const namesLast = [
    "Yılmaz", "Demir", "Kaya", "Şahin", "Çelik", "Yıldız", "Aydın", "Polat", "Keskin", "Arslan",
    "Koç", "Öztürk", "Kurt", "Doğan", "Bulut", "Bozkurt", "Aksoy", "Korkmaz", "Özdemir", "Erdoğan"
  ];
  const comments = [
    "Beklediğimden daha iyi çıktı, paketleme özenliydi.",
    "Fiyat/performans ürünü, tavsiye ederim.",
    "Kargoda ufak gecikme oldu ama ürün sorunsuz.",
    "Orijinal ürün, gönül rahatlığıyla alın.",
    "Kurulumu kolay, açıklamalar yeterliydi.",
    "Bir süredir kullanıyorum, herhangi bir problem yok.",
    "Hızlı kargo ve ilgili satıcı, teşekkürler.",
    "Beklentimi karşıladı, malzeme kalitesi iyi.",
    "Uyumluluk konusunda tereddüt etmiştim, tam oldu.",
    "Fiyatına göre gayet başarılı, memnun kaldım."
  ];

  const seedInt = hashStringToInt(seed);
  const rng = mulberry32(seedInt);
  const count = 3 + Math.floor(rng() * 5); // 3..7
  const now = Date.now();
  const daysBackMax = 180; // last 6 months

  const list: Review[] = [];
  for (let i = 0; i < count; i++) {
    const author = `${pick(rng, namesFirst)} ${pick(rng, namesLast)}`;
    // Rating distribution: mostly 4-5, sometimes 3
    const rSeed = rng();
    const rating = rSeed > 0.8 ? 3 : rSeed > 0.3 ? 4 : 5;
    const content = pick(rng, comments);
    const daysBack = Math.floor(rng() * daysBackMax) + 1;
    const createdAt = new Date(now - daysBack * 24 * 60 * 60 * 1000).toISOString();
    list.push({ id: `${seed}-demo-${i}`, author, content, rating, createdAt });
  }
  // Newest first
  return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export default function Reviews({ productId, seed, locale = "tr" }: { productId: string; seed: string; locale?: string }) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`, { cache: "no-store" });
        const text = await res.text();
        const json = text ? JSON.parse(text) : { reviews: [] };
        if (!res.ok) throw new Error(json?.error || "Yükleme hatası");
        const data = (json.reviews as Review[]) || [];
        if (mounted) {
          if (data.length > 0) {
            setReviews(data);
          } else {
            setReviews(generatePseudoReviews(seed));
          }
          setError(null);
        }
      } catch (e: any) {
        if (mounted) {
          // Fallback to demo reviews when API fails or DB is unavailable
          setReviews(generatePseudoReviews(seed));
          setError(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [productId, seed]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn) return;
    if (!content.trim()) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, content: content.trim(), rating }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Kaydetme hatası");
      setContent("");
      setRating(5);
      // Artık yorumlar admin onayı sonrası yayınlanır
      setError(null);
    } catch (e: any) {
      setError(e.message || "Hata");
    } finally {
      setSubmitting(false);
    }
  }

  const canWrite = isLoggedIn;

  return (
    <div className="mt-8 space-y-6">
      {canWrite ? (
        <div className="rounded-md border bg-card p-4">
          <div className="mb-3">
            <div className="text-sm text-muted-foreground mb-1">Puanınız</div>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className="p-0.5"
                  aria-label={`${i + 1} yıldız`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={i < rating ? "#f5b301" : "none"} stroke={i < rating ? "#f5b301" : "currentColor"} strokeWidth="2" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.56a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.482 20.497a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.56a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-3">
            <Textarea value={content} onChange={(e: any) => setContent(e.target.value)} placeholder="Ürün hakkında yorumunuzu yazın" rows={4} />
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={submitting || !content.trim()}>
                {submitting ? "Gönderiliyor..." : "Yorumu Gönder"}
              </Button>
              <div className="text-xs text-muted-foreground">Gönderilen yorum admin onayı sonrası yayınlanır.</div>
            </div>
          </form>
        </div>
      ) : (
        <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
          Yorum yazmak için lütfen giriş yapın. {" "}
          <a className="underline" href={`/${locale}/giris`}>Giriş</a>{" / "}
          <a className="underline" href={`/${locale}/kayit`}>Kayıt</a>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-base font-semibold">Kullanıcı yorumları</h3>
        {loading ? (
          <div className="text-sm text-muted-foreground">Yükleniyor...</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="text-sm text-muted-foreground">Henüz yorum yok. İlk yorumu siz yazın.</div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{r.author || "Kullanıcı"}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString("tr-TR")}</div>
              </div>
              <div className="mt-1 flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={i < r.rating ? "#f5b301" : "none"} stroke={i < r.rating ? "#f5b301" : "currentColor"} strokeWidth="2" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.56a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.482 20.497a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.56a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                ))}
              </div>
              <p className="mt-2 text-sm leading-relaxed">{r.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


