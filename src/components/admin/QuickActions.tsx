"use client";
import Link from "next/link";

export default function QuickActions({ base }: { base: string }){
  const actions = [
    { label: "Yeni Ürün", href: `${base}/products/new` },
    { label: "Kupon Oluştur", href: `${base}/coupons/new` },
    { label: "Kampanya Başlat", href: `${base}/campaigns/new` },
  ];
  return (
    <div className="rounded-lg border p-4">
      <div className="font-medium mb-3">Hızlı İşlemler</div>
      <div className="grid sm:grid-cols-3 gap-2">
        {actions.map(a=> (
          <Link key={a.href} href={a.href} className="inline-flex items-center justify-center rounded-md border px-3 py-2 hover:bg-accent/50">
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}




















