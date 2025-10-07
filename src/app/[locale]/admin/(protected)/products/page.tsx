"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Product = {
  id: string;
  title: string;
  brand: string;
  price: number;
  slug: string;
  images: any;
  category?: { name: string };
  _count?: { orderItems: number };
  description?: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [brands, setBrands] = useState<string[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    brand: "",
    price: 0,
    description: "",
    images: [] as string[],
  });
  const [originalImages, setOriginalImages] = useState<string[]>([]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(brandFilter !== "all" && { brand: brandFilter }),
      });
      // show more results per page to surface priced items
      params.set("limit", "200");
      const r = await fetch(`/api/admin/products?${params}`, { cache: "no-store" });
      const j = await r.json();
      setProducts(j.products || []);
      setTotalPages(j.totalPages || 1);
      setTotalProducts(j.total || 0);
      if (j.brands) setBrands(j.brands);
    } catch (e) {
      console.error("Failed to load products:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, brandFilter]);

  const handleSearch = () => {
    setPage(1);
    loadProducts();
  };

  const openEditModal = (product: Product) => {
    const productImages = Array.isArray(product.images) ? product.images : [];
    setEditingProduct(product);
    setOriginalImages(productImages);
    setEditForm({
      title: product.title,
      brand: product.brand,
      price: product.price,
      description: product.description || "",
      images: productImages,
    });
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setOriginalImages([]);
    setEditForm({ title: "", brand: "", price: 0, description: "", images: [] });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...editForm.images];
    newImages[index] = value;
    setEditForm({ ...editForm, images: newImages });
  };

  const addImageField = () => {
    setEditForm({ ...editForm, images: [...editForm.images, ""] });
  };

  const removeImageField = (index: number) => {
    const newImages = editForm.images.filter((_, i) => i !== index);
    setEditForm({ ...editForm, images: newImages });
  };

  const saveProduct = async () => {
    if (!editingProduct) return;
    
    try {
      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          brand: editForm.brand,
          price: editForm.price,
          description: editForm.description,
          images: editForm.images.filter(img => img.trim() !== ""),
        }),
      });

      if (response.ok) {
        closeEditModal();
        loadProducts();
      } else {
        alert("Ürün güncellenemedi");
      }
    } catch (e) {
      console.error("Failed to update product:", e);
      alert("Bir hata oluştu");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ürünler</h1>
          <p className="text-sm text-muted-foreground">Tüm ürünleri yönetin</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Ürün ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Markalar</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
        <Button onClick={handleSearch} variant="outline">Ara</Button>
      </div>

      <div className="rounded-lg border overflow-hidden bg-card">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Yükleniyor...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 font-medium">Görsel</th>
                    <th className="px-4 py-3 font-medium">Ürün</th>
                    <th className="px-4 py-3 font-medium">Marka</th>
                    <th className="px-4 py-3 font-medium">Kategori</th>
                    <th className="px-4 py-3 font-medium">Fiyat</th>
                    <th className="px-4 py-3 font-medium">Kaynak</th>
                    <th className="px-4 py-3 font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const images = Array.isArray(product.images) ? product.images : [];
                    const firstImage = images[0] || "/placeholder.png";
                    return (
                      <tr key={product.id} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <img
                            src={firstImage}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.png";
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-xs">
                            <div className="font-medium truncate">{product.title}</div>
                            <div className="text-xs text-muted-foreground font-mono truncate">
                              {product.slug}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{product.brand}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{product.category?.name || "—"}</Badge>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {product.price > 0 
                            ? `${(product.price / 100).toLocaleString("de-DE")} €`
                            : "—"
                          }
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{(product as any).source || "DB"}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(product)}
                          >
                            Düzenle
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {products.length === 0 && (
                    <tr className="border-t">
                      <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>
                        Ürün bulunamadı
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Önceki
                </Button>
                <div className="flex items-center px-4 text-sm">
                  Sayfa {page} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Sonraki
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={closeEditModal}
        >
          <div
            className="bg-card rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b sticky top-0 bg-card z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">Ürünü Düzenle</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {editingProduct.id}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeEditModal}>
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ürün Adı</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Ürün adı"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Marka</label>
                <input
                  type="text"
                  value={editForm.brand}
                  onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Marka"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Fiyat (EUR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.price / 100}
                  onChange={(e) => {
                    const eurValue = parseFloat(e.target.value) || 0;
                    setEditForm({ ...editForm, price: Math.round(eurValue * 100) });
                  }}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Fiyat (EUR)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cent: {editForm.price} (Önizleme: {(editForm.price / 100).toLocaleString("de-DE")} €)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Açıklama</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-md border px-3 py-2 text-sm min-h-[100px]"
                  placeholder="Ürün açıklaması"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Görseller (URL)</label>
                <div className="space-y-2">
                  {editForm.images.map((img, index) => {
                    const isOriginal = originalImages.includes(img);
                    return (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={isOriginal ? "●●●●●●●●●●●●●●●●" : img}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          className="flex-1 rounded-md border px-3 py-2 text-sm"
                          placeholder="Görsel URL"
                          readOnly={isOriginal}
                          title={isOriginal ? "Mevcut görsel (gizli)" : ""}
                        />
                        {img && (
                          <img
                            src={img}
                            alt={`Preview ${index + 1}`}
                            className="w-12 h-12 object-cover rounded border"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.png";
                            }}
                          />
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImageField(index)}
                        >
                          Sil
                        </Button>
                      </div>
                    );
                  })}
                  <Button size="sm" variant="outline" onClick={addImageField}>
                    + Görsel Ekle
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-muted/20 flex justify-end gap-2 sticky bottom-0">
              <Button variant="outline" onClick={closeEditModal}>
                İptal
              </Button>
              <Button onClick={saveProduct}>
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

