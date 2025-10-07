export type ImportedItem = {
  id: string;
  title: string;
  brand?: string;
  price?: number;
  image?: string;
  url?: string;
  description?: string;
};

export function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

export function shortHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) hash = (hash * 33) ^ input.charCodeAt(i);
  const v = (hash >>> 0).toString(36);
  return v.slice(0, 6);
}

export function buildImportedSlug(item: ImportedItem): string {
  const base = slugify(item.title || "urun");
  const h = shortHash(item.id || item.url || base);
  return `${base}-${h}`;
}









