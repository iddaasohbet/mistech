import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import productsStatic from "@/../public/data/products.json";
import { DEMO_EXPORT } from "@/lib/demo";
import { buildImportedSlug, findImportedProductBySlug, getSimilarImportedProducts } from "@/lib/imports";
import * as cheerio from "cheerio";
import { enrichPriceForUrl } from "@/lib/price-enrich";
import SimilarSlider from "./SimilarSlider";
import Reviews from "@/components/Reviews";
import InfoPanel from "./InfoPanel";
import Gallery from "./Gallery";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string; locale?: string }> }) {
  const resolved = await params;
  const { slug } = resolved;
  const locale = resolved.locale || "tr";
  const messages = (await import(`@/messages/${locale}.json`)).default as any;
  const t = messages.product;
  let product: any = null;
  let similar: any[] = [];

  if (!DEMO_EXPORT) {
    try {
      product = await prisma.product.findUnique({ where: { slug }, include: { variants: true } });
      if (product) {
        try {
          similar = await prisma.product.findMany({ where: { categoryId: product.categoryId, NOT: { id: product.id } }, take: 8 });
        } catch {}
      }
    } catch {}
  }

  if (!product) {
    // Try imported datasets (App/Samsung)
    const imp = await findImportedProductBySlug(slug);
    if (imp) {
      const enrichedPrice = await enrichPriceForUrl(imp.product.url, imp.product.price);
      product = {
        id: imp.product.id,
        title: imp.product.title,
        brand: imp.product.brand,
        price: enrichedPrice,
        images: imp.product.image ? [imp.product.image] : [],
      };
      similar = await getSimilarImportedProducts(imp.product, imp.source, 8);
      similar = similar.map((p) => ({ id: p.id, slug: buildImportedSlug(p), title: p.title, brand: p.brand, price: p.price, images: p.image ? [p.image] : [] }));
      const currency = "EUR" as const;
      const imgs = (product.images as unknown as string[]) || [];
      const description: string = (product as any).description ?? `${product.title} ürününde kalite ve performansı bir arada sunuyoruz.`;
      return (
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10 grid gap-6 md:gap-10 lg:grid-cols-2">
          <div>
            <Gallery images={imgs} title={product.title} />
          </div>
          <div>
            <InfoPanel 
              title={product.title} 
              brand={product.brand} 
              price={product.price} 
              currency={currency}
              productId={imp.product.id}
              cartProduct={{ id: imp.product.id, slug: buildImportedSlug(imp.product), title: imp.product.title, brand: imp.product.brand, price: product.price, currency, image: imgs[0] }} 
              translations={t}
              locale={locale}
            />
            <Tabs defaultValue="about" className="mt-8">
              <TabsList>
                <TabsTrigger value="about">{t.about || 'Ürün Hakkında'}</TabsTrigger>
                <TabsTrigger value="specs">{t.specs || 'Özellikler'}</TabsTrigger>
                <TabsTrigger value="shipping">{t.shipping || 'Kargo'}</TabsTrigger>
                <TabsTrigger value="warranty">{t.warranty || 'Garanti'}</TabsTrigger>
              </TabsList>
              <TabsContent value="about">
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/90">
                  <p>{description}</p>
                  <ul className="list-disc pl-5 text-muted-foreground">
                    <li>{t.guarantee || 'Orijinallik garantisi ve faturalı gönderim'}</li>
                    <li>{t.fastShipping || 'Hızlı teslimat ve güvenli paketleme'}</li>
                    <li>{t.returnPolicy || '14 gün iade ve değişim desteği'}</li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="specs">
                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="text-muted-foreground">{t.brand || 'Marka'}</div><div>{product.brand || '-'}</div>
                  <div className="text-muted-foreground">{t.model || 'Model'}</div><div>-</div>
                </div>
              </TabsContent>
              <TabsContent value="shipping">
                <p className="mt-4 text-sm">{t.shippingInfo || 'Aynı gün kargo. Tahmini teslim: 2-3 gün.'}</p>
              </TabsContent>
              <TabsContent value="warranty">
                <p className="mt-4 text-sm">{t.warrantyInfo || '2 yıl yetkili servis güvencesi.'}</p>
              </TabsContent>
            </Tabs>
          </div>
          <div className="lg:col-span-2">
            <div className="mt-6">
              <Reviews productId={imp.product.id} seed={imp.product.id} locale={locale} />
            </div>
            <h2 className="text-xl font-semibold mb-4">{t.similar || 'Benzer Ürünler'}</h2>
            <SimilarSlider
              products={similar}
              locale={locale}
            />
          </div>
        </div>
      );
    } else {
      product = (productsStatic as any[]).find((p) => p.slug === slug);
      if (!product) return notFound();
      similar = (productsStatic as any[]).filter((p) => p.slug !== slug).slice(0, 8);
    }
  }

  const imgs = (product.images as unknown as string[]) || [];
  const description: string = (product as any).description ?? `${product.title} ürününde kalite ve performansı bir arada sunuyoruz. ${product.brand} güvencesiyle hızlı kargo, faturalı gönderim ve 2 yıl garanti ile teslim edilir. Teknik özellikler ve kutu içeriği model ve varyanta göre değişebilir.`;
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10 grid gap-6 md:gap-10 lg:grid-cols-2">
      <div>
        <Gallery images={imgs} title={product.title} />
      </div>
      <div>
        <InfoPanel 
          title={product.title} 
          brand={product.brand} 
          price={product.price} 
          productId={product.id} 
          translations={t}
          locale={locale}
        />
        <Tabs defaultValue="about" className="mt-8">
          <TabsList>
            <TabsTrigger value="about">{t.about || 'Ürün Hakkında'}</TabsTrigger>
            <TabsTrigger value="specs">{t.specs || 'Özellikler'}</TabsTrigger>
            <TabsTrigger value="shipping">{t.shipping || 'Kargo'}</TabsTrigger>
            <TabsTrigger value="warranty">{t.warranty || 'Garanti'}</TabsTrigger>
          </TabsList>
          <TabsContent value="about">
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/90">
              <p>{description}</p>
              <ul className="list-disc pl-5 text-muted-foreground">
                <li>{t.guarantee || 'Orijinallik garantisi ve faturalı gönderim'}</li>
                <li>{t.fastShipping || 'Hızlı teslimat ve güvenli paketleme'}</li>
                <li>{t.returnPolicy || '14 gün iade ve değişim desteği'}</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="specs">
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="text-muted-foreground">{t.color || 'Renk'}</div><div>Mor</div>
              <div className="text-muted-foreground">{t.capacity || 'Kapasite'}</div><div>256 GB</div>
              <div className="text-muted-foreground">{t.screen || 'Ekran'}</div><div>6.7"</div>
            </div>
          </TabsContent>
          <TabsContent value="shipping">
            <p className="mt-4 text-sm">{t.shippingInfo || 'Aynı gün kargo. Tahmini teslim: 2-3 gün.'}</p>
          </TabsContent>
          <TabsContent value="warranty">
            <p className="mt-4 text-sm">{t.warrantyInfoOfficial || '2 yıl resmi distribütör garantisi.'}</p>
          </TabsContent>
        </Tabs>
      </div>
      <div className="lg:col-span-2">
        <div className="mt-6">
          <Reviews productId={product.id} seed={product.id} locale={locale} />
        </div>
        <h2 className="text-xl font-semibold mb-4">{t.similar || 'Benzer Ürünler'}</h2>
        <SimilarSlider
          products={similar.map((p) => ({ id: p.id, slug: p.slug, title: p.title, brand: p.brand, price: p.price, images: (p.images as unknown as string[]) || [] }))}
          locale={locale}
        />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  // Export pages for demo from static product slugs
  return (productsStatic as any[]).map((p) => ({ slug: p.slug }));
}


