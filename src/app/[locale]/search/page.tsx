import { Input } from "@/components/ui/input";

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
      <Input placeholder="Arama... (örn. iPhone 13 batarya)" className="h-12" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="aspect-square bg-muted rounded mb-3" />
            <div className="font-medium">Sonuç {i + 1}</div>
            <div className="text-sm text-muted-foreground">Kısa açıklama</div>
          </div>
        ))}
      </div>
    </div>
  );
}


