"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type FaqItem = {
  q: string;
  a: string;
};

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/faq", { cache: "no-store" });
      const j = await r.json();
      setFaqs(j.faqs || []);
    } catch (e) {
      console.error("Failed to load FAQs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const saveFaqs = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faqs }),
      });

      if (response.ok) {
        alert("SSS başarıyla kaydedildi!");
      } else {
        alert("Kayıt başarısız oldu");
      }
    } catch (e) {
      console.error("Failed to save FAQs:", e);
      alert("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const addFaq = () => {
    setFaqs([...faqs, { q: "", a: "" }]);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFaq = (index: number, field: "q" | "a", value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">SSS (Sıkça Sorulan Sorular)</h1>
          <p className="text-sm text-muted-foreground">
            Anasayfada görünen SSS bölümünü düzenleyin
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addFaq} variant="outline">
            + Yeni Soru Ekle
          </Button>
          <Button onClick={saveFaqs} disabled={saving}>
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground rounded-lg border">
            Yükleniyor...
          </div>
        ) : faqs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground rounded-lg border">
            Henüz SSS eklenmemiş. &quot;+ Yeni Soru Ekle&quot; butonuna tıklayın.
          </div>
        ) : (
          faqs.map((faq, index) => (
            <div key={index} className="rounded-lg border bg-card p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="text-sm font-medium text-muted-foreground">
                  Soru #{index + 1}
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeFaq(index)}
                >
                  Sil
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Soru</label>
                <input
                  type="text"
                  value={faq.q}
                  onChange={(e) => updateFaq(index, "q", e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Örn: Kargo süresi nedir?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cevap</label>
                <textarea
                  value={faq.a}
                  onChange={(e) => updateFaq(index, "a", e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm min-h-[100px]"
                  placeholder="Cevabı buraya yazın..."
                />
              </div>
            </div>
          ))
        )}
      </div>

      {faqs.length > 0 && (
        <div className="flex justify-end gap-2 p-4 border-t bg-muted/20 rounded-lg">
          <Button onClick={saveFaqs} disabled={saving}>
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </div>
      )}
    </div>
  );
}


