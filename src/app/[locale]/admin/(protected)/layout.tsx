import Link from "next/link";
import Sidebar from "@/components/admin/Sidebar";
import AdminMount from "@/components/admin/AdminMount";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminProtectedLayout({ params, children }: { params: Promise<{ locale: string }>; children: React.ReactNode }) {
  const { locale } = await params;
  const base = `/${locale}/admin`;
  const nav: { group: string; items: { label: string; href: string }[] }[] = [
    { group: "Genel", items: [
      { label: "Özet", href: `${base}` },
      { label: "Siparişler", href: `${base}/orders` },
      { label: "Raporlar", href: `${base}/reports` },
    ] },
    { group: "Katalog", items: [
      { label: "Ürünler", href: `${base}/products` },
      { label: "Kategoriler", href: `${base}/categories` },
      { label: "Markalar", href: `${base}/brands` },
      { label: "Kuponlar", href: `${base}/coupons` },
    ] },
    { group: "Müşteriler", items: [
      { label: "Müşteriler", href: `${base}/customers` },
    ] },
    { group: "İçerik", items: [
      { label: "SSS", href: `${base}/faq` },
    ] },
    { group: "Ayarlar", items: [
      { label: "Genel Ayarlar", href: `${base}/settings` },
      { label: "Kargo", href: `${base}/shipping` },
      { label: "Ödeme", href: `${base}/payments` },
      { label: "Entegrasyonlar", href: `${base}/integrations` },
      { label: "Kullanıcılar/Roller", href: `${base}/users` },
    ] },
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px_1fr] bg-background">
      {/* add body.admin-layout to hide site chrome */}
      <AdminMount />
      <Sidebar base={base} />
      <main className="min-h-screen">
        <AdminHeader locale={locale} />
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}


