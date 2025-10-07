import { readFile } from "node:fs/promises";
import path from "node:path";

type BannerRow = {
  title?: string;
  items: { href: string; image: string; alt?: string; title?: string; subtitle?: string }[];
};

async function loadBanners(): Promise<BannerRow[]> {
  try {
    const fp = path.join(process.cwd(), "public", "data", "home-banners.json");
    const raw = await readFile(fp, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function HomeBannerGrid({ locale }: { locale: string }) {
  const rows = await loadBanners();
  if (!rows.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-6 pb-8">
      {rows.map((row, idx) => (
        <div key={idx} className="mt-6">
          {row.title && <h3 className="sr-only">{row.title}</h3>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {(row.items || []).slice(0, 3).map((b, i) => (
              <a
                key={i}
                href={b.href.startsWith("/") ? `/${locale}${b.href}` : b.href}
                className="group block rounded-xl overflow-hidden border bg-card transition relative hover:shadow-lg hover:-translate-y-0.5 duration-300 ease-out"
              >
                <img
                  src={b.image}
                  alt={b.alt || "Banner"}
                  className="w-full h-40 md:h-48 object-contain bg-white p-1 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />
                {(b.title || b.subtitle) && (
                  <div className="absolute inset-0 p-4 flex items-center justify-center text-center">
                    <div className="inline-flex flex-col items-center gap-1 rounded-md bg-black/55 px-3 py-2 transition-opacity duration-300 group-hover:bg-black/60">
                      {b.title && <div className="text-white font-semibold leading-tight">{b.title}</div>}
                      {b.subtitle && <div className="text-white/90 text-xs leading-tight">{b.subtitle}</div>}
                    </div>
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}


