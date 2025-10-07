"use client";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, MapPin, FileText, Heart, Settings } from "lucide-react";

export default function AccountNav() {
  const pathname = usePathname();
  const base = pathname.split("/hesap")[0] + "/hesap";
  const items = [
    { href: `${base}`, label: "Genel Bakış", Icon: LayoutDashboard },
    { href: `${base}/siparisler`, label: "Siparişler", Icon: Package },
    { href: `${base}/adresler`, label: "Adresler", Icon: MapPin },
    { href: `${base}/fatura`, label: "Fatura Bilgileri", Icon: FileText },
    { href: `${base}/favoriler`, label: "Favoriler", Icon: Heart },
    { href: `${base}/ayarlar`, label: "Ayarlar", Icon: Settings },
  ];

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-sm font-semibold mb-3">Hesabım</div>
      <nav className="grid gap-2 text-sm">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <a key={href} href={href} className={`flex items-center gap-2 px-3 py-2 rounded-md border transition ${active ? "bg-accent" : "hover:bg-accent"}`}>
              <Icon className="size-4" /> {label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}


