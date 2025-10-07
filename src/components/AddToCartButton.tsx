"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { CartProduct } from "@/lib/cart";

export default function AddToCartButton({ productId, product, label }: { productId?: string; product?: CartProduct; label?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    try {
      setLoading(true);
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: productId ?? product?.id, qty: 1, product })
      });
      if (!res.ok) throw new Error('failed');
      toast.success("Sepete eklendi");
    } catch (e) {
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="lg" onClick={handleClick} disabled={loading}>
      {loading ? "Ekleniyor..." : (label ?? "Sepete Ekle")}
    </Button>
  );
}


