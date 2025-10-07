import Image from "next/image";
import { Button } from "@/components/ui/button";
import CartRow from "./CartRow";
import { prisma } from "@/lib/db";
import { readCart, writeCart } from "@/lib/cart";
import { cookies } from "next/headers";
import productsStatic from "@/../public/data/products.json";
import { DEMO_EXPORT } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function CartPage({ params }: { params: Promise<{ locale?: string }> }) {
  const resolved = await params;
  const locale = resolved?.locale || "tr";
  const messages = (await import(`@/messages/${locale}.json`)).default as any;
  const t = messages.cart || {};
  
  // In demo export, cookies are not available at build time; fall back to empty cart
  let cart: any = { items: [] };
  try { await cookies(); cart = await readCart(); } catch {}
  const productIds = cart.items.map((x: any) => x.productId);
  const products = DEMO_EXPORT
    ? (productsStatic as any[]).filter((p) => productIds.includes(p.id))
    : (productIds.length ? await prisma.product.findMany({ where: { id: { in: productIds } } }) : []);
  const items = cart.items.map((ci: any) => {
    const fromDb = products.find((p) => p.id === ci.productId);
    const merged = fromDb || ci.product || null;
    if (!merged) return null;
    return { qty: ci.qty, product: merged };
  }).filter((x: any) => !!x);

  const currency: 'TRY' | 'EUR' = (items.find((it: any) => it.product && it.product.currency)?.product.currency) || 'EUR';
  const subtotal = items.reduce((sum: number, it: any) => {
    const unit = typeof it.product.price === 'number' ? it.product.price : 0;
    return sum + unit * it.qty;
  }, 0);
  const shipping = currency === 'EUR' ? 0 : (items.length > 0 ? 4900 : 0);
  const total = subtotal + shipping;
  const fmt = (minor: number) => currency === 'EUR'
    ? `€ ${(minor / 100).toLocaleString('de-DE')}`
    : `₺ ${(minor / 100).toLocaleString('tr-TR')}`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 grid gap-8 xl:grid-cols-[1fr_420px]">
      <div className="space-y-4">
        {items.map((it: any) => (
          <CartRow key={it.product.id} item={it} />
        ))}
        {items.length === 0 && (
          <div className="rounded-lg border p-6 text-sm text-muted-foreground">{t.empty || 'Sepetiniz boş.'}</div>
        )}
      </div>
      <aside className="border rounded-lg p-5 space-y-4 h-fit bg-card">
        <div>
          <div className="text-sm font-medium mb-2">{t.coupon || 'Kupon / İndirim Kodu'}</div>
          <div className="flex gap-2">
            <input disabled className="w-full border rounded px-3 py-2 text-sm" placeholder="KUPON2025" />
            <Button type="button" variant="outline" disabled>{t.apply || 'Uygula'}</Button>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>{t.subtotal || 'Ara toplam'}</span><span>{fmt(subtotal)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>{t.shipping || 'Kargo'}</span><span>{fmt(shipping)}</span></div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t"><span>{t.total || 'Toplam'}</span><span>{fmt(total)}</span></div>
        </div>
        <Button className="w-full">{t.checkout || 'Ödemeye Geç'}</Button>
        <div className="flex gap-2">
          <Button variant="outline" className="w-1/2" asChild>
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(['Ürün ID','Başlık','Marka','Adet','Fiyat (minor)','Para Birimi'].join(',')+'\n'+items.map((it:any)=>[it.product.id, it.product.title, it.product.brand||'', it.qty, it.product.price??'', (it.product.currency||'TRY')].join(',')).join('\n'))}`}
              download={`sepet-${Date.now()}.csv`}
            >
              {t.downloadCsv || 'CSV indir'}
            </a>
          </Button>
          <Button variant="outline" className="w-1/2" asChild>
            <a target="_blank" rel="noopener noreferrer" href={`https://wa.me/4915164841342?text=${encodeURIComponent(items.map((it:any)=>`- ${it.product.title} (${it.qty} adet)`).join('\n'))}`}>
              {t.whatsappOrder || 'WhatsApp Hızlı Sipariş'}
            </a>
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">{t.deliveryInfo || 'Tahmini teslim: 2-3 iş günü • İade süresi 14 gün'}</div>
      </aside>
    </div>
  );
}


