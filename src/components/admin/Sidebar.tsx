"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutGrid, Package2, ShoppingCart, BarChart3, Users, BookOpen, Settings, Globe, Tag, Boxes, Image as ImageIcon, MessageSquare } from "lucide-react";

type Item = { label: string; href: string; icon: React.ComponentType<any> };
type Group = { title: string; items: Item[] };

export default function AdminSidebar({ base }: { base: string }) {
  const pathname = usePathname();
  const groups: Group[] = [
    { title: "Genel", items: [
      { label: "Özet", href: `${base}`, icon: LayoutGrid },
      { label: "Siparişler", href: `${base}/orders`, icon: ShoppingCart },
      { label: "Raporlar", href: `${base}/reports`, icon: BarChart3 },
    ]},
    { title: "Katalog", items: [
      { label: "Ürünler", href: `${base}/products`, icon: Package2 },
      { label: "Kategoriler", href: `${base}/categories`, icon: Boxes },
      { label: "Markalar", href: `${base}/brands`, icon: Tag },
    ]},
    { title: "Müşteriler", items: [
      { label: "Müşteriler", href: `${base}/customers`, icon: Users },
    ]},
    { title: "Topluluk", items: [
      { label: "Yorumlar", href: `${base}/reviews`, icon: MessageSquare },
    ]},
    { title: "İçerik", items: [
      { label: "SSS", href: `${base}/faq`, icon: BookOpen },
      { label: "Banners", href: `${base}/banners`, icon: ImageIcon },
    ]},
    { title: "Ayarlar", items: [
      { label: "Genel Ayarlar", href: `${base}/settings`, icon: Settings },
      { label: "Kargo", href: `${base}/shipping`, icon: Globe },
      { label: "Ödeme", href: `${base}/payments`, icon: Settings },
      { label: "Entegrasyonlar", href: `${base}/integrations`, icon: Settings },
      { label: "Kullanıcılar/Roller", href: `${base}/users`, icon: Users },
    ]},
  ];

  return (
    <aside className="border-r bg-gradient-to-b from-muted/40 to-background">
      <div className="h-14 px-4 flex items-center font-semibold">Yönetim</div>
      <nav className="px-3 pb-6 space-y-6 text-sm">
        {groups.map((g)=> (
          <div key={g.title} className="space-y-2">
            <div className="px-2 pt-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{g.title}</div>
            <div className="space-y-1">
              {g.items.map((it)=> {
                const active = pathname === it.href || (it.href !== `${base}` && pathname.startsWith(it.href));
                const Icon = it.icon;
                return (
                  <Link key={it.href} href={it.href} className={cn(
                    "group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors",
                    active ? "bg-primary/10 text-primary" : "hover:bg-accent/60"
                  )}>
                    <Icon className={cn("size-4", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    <span>{it.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        {/* Banners link moved into İçerik group above */}
      </nav>
    </aside>
  );
}



