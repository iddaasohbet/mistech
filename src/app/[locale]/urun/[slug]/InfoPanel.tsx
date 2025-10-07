"use client";
import { Button } from "@/components/ui/button";
import AddToCartButton from "@/components/AddToCartButton";
import type { CartProduct } from "@/lib/cart";
import { useSession } from "next-auth/react";
import { generateStockCode } from "@/lib/stock-code";
import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";

type Currency = "TRY" | "EUR";

export default function InfoPanel({
  title,
  brand,
  price,
  currency = "TRY",
  productId,
  cartProduct,
  translations,
  locale = "tr"
}: {
  title: string;
  brand?: string;
  price?: number;
  currency?: Currency;
  productId?: string;
  cartProduct?: CartProduct;
  translations?: any;
  locale?: string;
}) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  
  const t = translations || {
    cashPrice: 'Peşin Fiyat',
    contactForPrice: 'Fiyat için iletişime geçin',
    vatIncluded: 'KDV dahildir • Hızlı kargo',
    quickContact: 'Hızlı İletişim',
    fastShipping: 'Hızlı Kargo',
    guarantee: 'Orijinallik Garantisi',
    warranty: '2 Yıl Garanti',
    return: '14 Gün İade',
    stockCode: 'Stok Kodu',
    loginToSeePrice: 'Sadece Ticari Müşterilere',
    loginToSeePriceDesc: 'Fiyatları görüntülemek ve sipariş verebilmek için ticari müşteri kaydınızın olması ve onaylanmış olması gerekmektedir.',
    loginNow: 'Giriş Yap',
    registerNow: 'Başvuru Yap'
  };
  
  const stockCode = productId ? generateStockCode(productId, brand) : null;
  
  const formatPrice = () => {
    if (typeof price !== "number") return null;
    if (currency === "EUR") {
      return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(price / 100);
    }
    return `₺ ${(price / 100).toLocaleString("tr-TR")}`;
  };
  
  return (
    <div className="space-y-4">
      <div>
        {brand && <div className="text-sm text-muted-foreground">{brand}</div>}
        <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
        {stockCode && (
          <div className="mt-2 text-xs text-muted-foreground">
            {t.stockCode}: <span className="font-mono font-medium text-foreground">{stockCode}</span>
          </div>
        )}
      </div>
      
      <div className="rounded-md border bg-card p-4">
        {isLoggedIn ? (
          <>
            <div className="text-xs text-muted-foreground">{t.cashPrice}</div>
            {formatPrice() ? (
              <div className="text-3xl font-bold">{formatPrice()}</div>
            ) : (
              <div className="text-sm text-muted-foreground">{t.contactForPrice}</div>
            )}
            <div className="mt-1 text-xs text-muted-foreground">{t.vatIncluded}</div>
            <div className="mt-4 flex gap-3">
              {productId || cartProduct ? (
                <AddToCartButton productId={productId} product={cartProduct} />
              ) : null}
              <Button variant="outline" size="lg" asChild>
                <a href="https://wa.me/4915164841342" target="_blank" rel="noopener noreferrer">{t.quickContact}</a>
              </Button>
            </div>
          </>
        ) : (
          <div className="py-4">
            <div className="text-xl font-semibold mb-2">{t.loginToSeePrice}</div>
            <p className="text-sm text-muted-foreground mb-4">{t.loginToSeePriceDesc}</p>
            <div className="flex gap-3">
              <Button asChild size="lg">
                <Link href={`/${locale}/giris`}>
                  <LogIn className="mr-2 size-4" />
                  {t.loginNow}
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href={`/${locale}/kayit`}>
                  <UserPlus className="mr-2 size-4" />
                  {t.registerNow}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <ul className="grid grid-cols-2 gap-2 text-sm">
        <li className="rounded-md border p-2">{t.fastShipping}</li>
        <li className="rounded-md border p-2">{t.guarantee}</li>
        <li className="rounded-md border p-2">{t.warranty}</li>
        <li className="rounded-md border p-2">{t.return}</li>
      </ul>
    </div>
  );
}


