"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent?: { name: string } | null;
  _count?: { products: number; children: number };
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/categories", { cache: "no-store" });
      const j = await r.json();
      setCategories(j.categories || []);
    } catch (e) {
      console.error("Failed to load categories:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kategoriler</h1>
          <p className="text-sm text-muted-foreground">Mevcut sistemdeki tüm kategoriler</p>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden bg-card">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Yükleniyor...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground bg-muted/30">
                <tr>
                  <th className="px-4 py-3 font-medium">Kategori Adı</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Üst Kategori</th>
                  <th className="px-4 py-3 font-medium">Ürün Sayısı</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-t hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{category.slug}</code>
                    </td>
                    <td className="px-4 py-3">
                      {category.parent ? (
                        <Badge variant="outline">{category.parent.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {category._count?.products || 0}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">Sistem Kategorisi</Badge>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr className="border-t">
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>
                      Kategori bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

