import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 grid gap-8 md:grid-cols-[1fr_360px]">
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="Ad" />
          <Input placeholder="Soyad" />
        </div>
        <Input placeholder="E-posta" />
        <Input placeholder="Adres" />
        <Input placeholder="Şehir" />
        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="Kart No" />
          <Input placeholder="CVV" />
        </div>
        <Button>Beyi Tamamla</Button>
      </form>
      <aside className="border rounded-lg p-4 space-y-3 h-fit">
        <div className="flex justify-between"><span>Ara toplam</span><span>₺ 19.998</span></div>
        <div className="flex justify-between text-muted-foreground text-sm"><span>Kargo</span><span>₺ 49</span></div>
        <div className="flex justify-between font-semibold"><span>Toplam</span><span>₺ 20.047</span></div>
        <div className="text-xs text-muted-foreground">Tahmini teslim: 2-3 gün</div>
      </aside>
    </div>
  );
}


