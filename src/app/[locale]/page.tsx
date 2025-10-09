export const dynamic = "force-dynamic";
import { Hero } from "./(home)/hero";
import { TrustBadges, USPBar, MiniFAQ } from "./(home)/sections";
import HomeAllProducts from "./(home)/HomeAllProducts";
import HomeTestimonials from "@/components/HomeTestimonials";
import { readFile } from "node:fs/promises";
import path from "node:path";

type PageProps = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const resolvedLocale = locale ?? "tr";
  const messages = (await import(`../../messages/${resolvedLocale}.json`)).default as any;
  const t = messages.hero ?? { headline: "Mistech", subtitle: "", cta: "Hemen Satın Al" };

  async function read(file: string) {
    try {
      const fp = path.join(process.cwd(), "public", "data", file);
      const raw = await readFile(fp, "utf8");
      const data = JSON.parse(raw) || [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [] as any[];
    }
  }

  const files = [
    "apps-import.json",
    "samsung-import.json",
    "oppo-import.json",
    "xiaomi-import.json",
    "huawei-import.json",
    "oneplus-import.json",
    "realme-import.json",
    "google-import.json",
    "motorola-import.json",
    "nokia-import.json",
    "vivo-import.json",
    "sony-import.json",
    "lg-import.json",
    "microsoft-import.json",
    "lenovo-import.json",
    "asus-import.json",
    "wiko-import.json",
    "zte-import.json",
    // accessories
    "accessories-screen-protectors.json",
    "accessories-cases-and-covers.json",
    "accessories-holders.json",
    "accessories-cables.json",
    "accessories-chargers.json",
    "accessories-audio.json",
    "accessories-data-storage.json"
  ];
  const allCats = (await Promise.all(files.map(read))).flat();
  const ids = new Set<string>();
  for (const c of allCats) {
    for (const it of (c as any)?.items || []) {
      if (it?.id) ids.add(String(it.id));
    }
  }
  const totalCount = ids.size;

  return (
    <div>
      <Hero
        title={t.headline}
        subtitle={t.subtitle}
        ctaLabel={t.cta ?? "Hemen Satın Al"}
        ctaHref={`/${resolvedLocale}/urunler`}
      />
      <USPBar totalCount={totalCount} />
      <HomeAllProducts locale={resolvedLocale as any} />
      <HomeTestimonials />
      <TrustBadges />
      <MiniFAQ />
    </div>
  );
}
