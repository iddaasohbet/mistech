import ListingCard from "@/components/ListingCard";
import Pagination from "@/components/Pagination";
import { buildImportedSlug } from "@/lib/imports";
import { readFile } from "node:fs/promises";
import path from "node:path";

type ImportedItem = { id: string; title: string; brand?: string; price?: number; image?: string; url?: string };
type ImportedCategory = { category: string; url: string; items: ImportedItem[] };

async function loadAccessories(kind?: 'screen-protectors' | 'cases-and-covers' | 'holders' | 'cables' | 'chargers' | 'audio' | 'data-storage'): Promise<ImportedCategory[]> {
  try {
    const files = [
      { k: 'screen-protectors', fp: path.join(process.cwd(), 'public', 'data', 'accessories-screen-protectors.json') },
      { k: 'cases-and-covers', fp: path.join(process.cwd(), 'public', 'data', 'accessories-cases-and-covers.json') },
      { k: 'holders', fp: path.join(process.cwd(), 'public', 'data', 'accessories-holders.json') },
      { k: 'cables', fp: path.join(process.cwd(), 'public', 'data', 'accessories-cables.json') },
      { k: 'chargers', fp: path.join(process.cwd(), 'public', 'data', 'accessories-chargers.json') },
      { k: 'audio', fp: path.join(process.cwd(), 'public', 'data', 'accessories-audio.json') },
      { k: 'data-storage', fp: path.join(process.cwd(), 'public', 'data', 'accessories-data-storage.json') },
    ];
    const pick = files.filter(f => !kind || f.k === kind);
    const arrays: ImportedCategory[][] = [];
    for (const f of pick) {
      try { const raw = await readFile(f.fp, 'utf8'); const data = JSON.parse(raw); if (Array.isArray(data)) arrays.push(data); } catch {}
    }
    return arrays.flat();
  } catch { return []; }
}

function normalize(x: string) { return x.toLowerCase().replace(/\s+/g, " ").trim(); }
function labelFromUrl(u: string): string {
  try {
    const url = new URL(u); const parts = url.pathname.split("/").filter(Boolean);
    const last = parts.pop() || ""; return decodeURIComponent(last).replace(/[-_]/g, " ").trim();
  } catch { return ""; }
}

function canonicalBrandLabel(input?: string): string {
  let n = normalize(input || "");
  if (!n) return "";
  // Strip leading "for " if present (e.g., "for apple", "for samsung")
  if (n.startsWith("for ")) n = n.slice(4);
  // Map special cases
  if (n === "apple") return "Apple";
  if (n === "white label" || n === "white-label") return "White label";
  // Known brands keep their Turkish/capitalized form
  const known = new Map<string, string>([
    ["xiaomi", "Xiaomi"],
    ["samsung", "Samsung"],
    ["rixus", "Rixus"],
    ["durata", "Durata"],
    ["philips", "Philips"],
    ["sunshine", "Sunshine"],
    ["onten", "Onten"],
    ["alt", "Alt"],
    ["google", "Google"],
    ["oneplus", "OnePlus"],
    ["nokia", "Nokia"],
    ["realme", "Realme"],
    ["vivo", "Vivo"],
    ["sony", "Sony"],
    ["lg", "LG"],
    ["microsoft", "Microsoft"],
    ["lenovo", "Lenovo"],
    ["asus", "ASUS"],
    ["wiko", "Wiko"],
    ["zte", "ZTE"],
    ["nintendo", "Nintendo"],
  ]);
  if (known.has(n)) return known.get(n)!;
  // Default: Title Case
  return n.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
}

function genericLabelForKind(kind: string): string {
  if (kind === 'holders') return 'holders';
  if (kind === 'cases-and-covers') return 'cases and covers';
  if (kind === 'cables') return 'cables';
  return 'screen protectors';
}

export default async function AccessoriesPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams?: Promise<{ cat?: string; page?: string; type?: string }> }) {
  const { locale } = await params;
  const s = (await (searchParams ?? Promise.resolve({} as any))) as { cat?: string; page?: string; type?: string };
  const kind = s?.type === 'cases-and-covers' ? 'cases-and-covers' : s?.type === 'holders' ? 'holders' : s?.type === 'cables' ? 'cables' : s?.type === 'chargers' ? 'chargers' : s?.type === 'audio' ? 'audio' : s?.type === 'data-storage' ? 'data-storage' : 'screen-protectors';
  const cats = await loadAccessories(kind);
  const categoriesAll = cats.filter(c => (c.items?.length ?? 0) > 0);
  const modelQuery = s?.cat ? decodeURIComponent(s.cat) : "";
  const nq = normalize(modelQuery);

  const pageNum = Math.max(1, parseInt(String(s?.page ?? "1"), 10) || 1);
  const pageSize = 24;

  // Build sidebar groups from categories (brand-specific endpoints)
  const catBrandToIds = new Map<string, { label: string; ids: Set<string> }>();
  for (const c of categoriesAll) {
    const raw = (c.category || labelFromUrl(c.url) || "").trim();
    const label = canonicalBrandLabel(raw);
    if (!label) continue;
    const key = normalize(label);
    if (!catBrandToIds.has(key)) catBrandToIds.set(key, { label, ids: new Set<string>() });
    const g = catBrandToIds.get(key)!;
    for (const it of c.items) if (it?.id) g.ids.add(it.id);
  }
  const groups = Array.from(catBrandToIds.values()).map(g => ({ label: g.label, count: g.ids.size })).sort((a,b)=> b.count - a.count);

  // Filter products by selected brand (from category labels)
  const activeBrandKey = nq || "";
  let products: ImportedItem[] = [];
  const selectedCategories = activeBrandKey
    ? categoriesAll.filter(c => normalize(canonicalBrandLabel(c.category || labelFromUrl(c.url))) === activeBrandKey)
    : categoriesAll;
  const seen = new Set<string>();
  for (const c of selectedCategories) {
    for (const it of c.items) {
      if (it?.id && !seen.has(it.id)) { seen.add(it.id); products.push(it); }
    }
  }

  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const slice = products.slice((pageNum - 1) * pageSize, pageNum * pageSize);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Aksesuarlar – {kind === 'cases-and-covers' ? 'Kılıf & Kapaklar' : kind === 'holders' ? 'Tutucular' : kind === 'cables' ? 'Kablolar' : kind === 'chargers' ? 'Şarj Aletleri' : kind === 'audio' ? 'Ses Ürünleri' : kind === 'data-storage' ? 'Depolama' : 'Ekran Koruyucular'}</h1>
        <p className="text-sm text-muted-foreground">Alt kategoriler ve ürünler</p>
      </div>
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <div className="rounded-md border p-3">
            <div className="font-medium mb-2">Alt Kategoriler</div>
            <div className="space-y-1 max-h-[70vh] overflow-auto pr-1">
              <a href={`/${locale}/kategori/accessories?type=${kind}`} className={`block text-sm px-2 py-1 rounded ${!nq ? 'bg-accent/50' : 'hover:bg-accent/30'}`}>Tümü ({total.toLocaleString('tr-TR')})</a>
              {groups.map((g, i) => {
                const active = normalize(g.label) === nq;
                const href = `/${locale}/kategori/accessories?type=${kind}&cat=${encodeURIComponent(g.label)}`;
                return (
                  <a key={g.label + i} href={href} className={`block text-sm px-2 py-1 rounded ${active ? 'bg-accent/50' : 'hover:bg-accent/30'}`}>
                    {g.label} ({g.count.toLocaleString('tr-TR')})
                  </a>
                );
              })}
            </div>
          </div>
        </aside>
        <div className="lg:col-span-3">
          <h2 className="text-lg font-semibold mb-3">Ürünler {total ? `(${total.toLocaleString('tr-TR')})` : ''}</h2>
          {slice.length === 0 ? (
            <div className="text-sm text-muted-foreground">Ürün bulunamadı.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {slice.map((p,i) => (
                <ListingCard
                  key={p.id}
                  index={i}
                  href={`/${locale}/urun/${buildImportedSlug(p as any)}`}
                  title={p.title}
                  brand={p.brand}
                  price={p.price}
                  image={p.image}
                  badge={{ label: "Schnelle Lieferung" }}
                  actions
                />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <Pagination
              current={pageNum}
              total={totalPages}
              makeHref={(p)=>`/${locale}/kategori/accessories?${new URLSearchParams({ type: kind, ...(nq ? { cat: modelQuery } : {}), page: String(p) }).toString()}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}


