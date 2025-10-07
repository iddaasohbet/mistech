"use client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type Brand = {
  slug: string;
  name: string;
  productCount: number;
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/brands", { cache: "no-store" });
      const j = await r.json();
      setBrands(j.brands || []);
    } catch (e) {
      console.error("Failed to load brands:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Markalar</h1>
          <p className="text-sm text-muted-foreground">Sistemdeki tüm markalar</p>
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
                  <th className="px-4 py-3 font-medium">Marka Adı</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Ürün Sayısı</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.slug} className="border-t hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{brand.name}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{brand.slug}</code>
                    </td>
                    <td className="px-4 py-3 text-center">{brand.productCount.toLocaleString("de-DE")}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">Sistem Markası</Badge>
                    </td>
                  </tr>
                ))}
                {brands.length === 0 && (
                  <tr className="border-t">
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={4}>
                      Marka bulunamadı
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


