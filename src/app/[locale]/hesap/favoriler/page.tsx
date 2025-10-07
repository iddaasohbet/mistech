export default function FavoritesPage() {
  const items = Array.from({ length: 4 }).map((_, i) => ({
    title: `Favori Ürün ${i + 1}`,
    price: 999900,
  }));
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Favoriler</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((it, i) => (
          <div key={i} className="rounded border p-3">
            <div className="aspect-square rounded bg-muted mb-2" />
            <div className="text-sm font-medium line-clamp-2">{it.title}</div>
            <div className="text-sm font-semibold">₺ {(it.price / 100).toLocaleString("tr-TR")}</div>
            <div className="flex gap-2 mt-2">
              <button className="rounded bg-foreground text-background px-3 py-1 text-xs">Sepete Ekle</button>
              <button className="rounded border px-3 py-1 text-xs">Kaldır</button>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <div className="rounded border p-4 text-sm text-muted-foreground">Henüz favori ürün yok.</div>
      )}
    </div>
  );
}


