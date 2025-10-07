"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function CartRow({ item }: { item: { qty: number; product: any } }) {
  const { product, qty } = item;
  const imgs = Array.isArray(product.images) && product.images.length > 0
    ? product.images as string[]
    : (product.image ? [product.image as string] : []);
  const unitMinor = typeof product.price === "number" ? product.price : 0;
  const currency = product.currency === "EUR" ? "EUR" : "TRY";

  async function remove() {
    await fetch(`/api/cart?productId=${encodeURIComponent(product.id)}`, { method: 'DELETE' });
    window.location.reload();
  }

  return (
    <div className="flex items-center justify-between gap-4 border rounded-lg p-4">
      <div className="flex items-center gap-4">
        <div className="relative size-16 rounded bg-muted overflow-hidden">
          {imgs[0] && (
            <Image src={imgs[0]} alt={product.title} fill className="object-contain" />
          )}
        </div>
        <div>
          <div className="font-medium line-clamp-1">{product.title}</div>
          <div className="text-xs text-muted-foreground">{product.brand}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" type="button" disabled>-</Button>
        <div className="w-8 text-center text-sm">{qty}</div>
        <Button variant="outline" size="icon" type="button" disabled>+</Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground" type="button" onClick={remove}>Kaldır</Button>
      </div>
      <div className="font-medium whitespace-nowrap">
        {currency === 'EUR' ? `€ ${(unitMinor * qty / 100).toLocaleString('de-DE')}` : `₺ ${(unitMinor * qty / 100).toLocaleString('tr-TR')}`}
      </div>
    </div>
  );
}


