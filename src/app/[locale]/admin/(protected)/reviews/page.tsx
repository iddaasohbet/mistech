"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Review = {
  id: string;
  author: string;
  content: string;
  rating: number;
  createdAt: string;
  productId?: string;
  approved?: boolean;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/reviews`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Yüklenemedi");
        if (mounted) setReviews(json.reviews || []);
      } catch (e: any) {
        if (mounted) setError(e.message || "Hata");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function remove(id: string) {
    const prev = reviews;
    setReviews((r) => r.filter((x) => x.id !== id));
    const res = await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      // revert on failure
      setReviews(prev);
    }
  }

  async function save(id: string, data: Partial<Review>) {
    const prev = reviews;
    setReviews((r) => r.map((x) => (x.id === id ? { ...x, ...data } : x)));
    const res = await fetch(`/api/admin/reviews/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) setReviews(prev);
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold mb-4">Yorumlar</h1>
      {loading ? (
        <div className="text-sm text-muted-foreground">Yükleniyor...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Tarih</th>
                <th className="py-2 pr-4">Yazar</th>
                <th className="py-2 pr-4">Puan</th>
                <th className="py-2 pr-4">Yorum</th>
                <th className="py-2 pr-4">Onay</th>
                <th className="py-2 pr-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b align-top">
                  <td className="py-2 pr-4 whitespace-nowrap">{new Date(r.createdAt).toLocaleString("tr-TR")}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{r.author}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <input
                      className="w-16 rounded border bg-background px-2 py-1"
                      type="number"
                      min={1}
                      max={5}
                      value={r.rating}
                      onChange={(e) => save(r.id, { rating: Number(e.target.value) })}
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <textarea
                      className="w-full min-w-[18rem] rounded border bg-background p-2"
                      value={r.content}
                      rows={2}
                      onChange={(e) => save(r.id, { content: e.target.value })}
                    />
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!r.approved} onChange={(e) => save(r.id, { approved: e.target.checked })} />
                      {r.approved ? "Onaylı" : "Beklemede"}
                    </label>
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <Button variant="outline" size="sm" onClick={() => remove(r.id)}>Sil</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reviews.length === 0 && (
            <div className="text-sm text-muted-foreground">Gösterilecek yorum yok.</div>
          )}
        </div>
      )}
    </div>
  );
}


