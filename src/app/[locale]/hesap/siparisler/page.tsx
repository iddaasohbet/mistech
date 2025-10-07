import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function OrdersPage() {
  const orders = Array.from({ length: 4 }).map((_, i) => ({
    id: `SIP-${1234 + i}`,
    date: "2025-09-28",
    total: 259990,
    status: ["Hazırlanıyor", "Kargoda", "Teslim Edildi", "İptal"][i % 4],
  }));
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-xl font-semibold">Siparişler</h1>
        <Select defaultValue="tum">
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Durum" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="tum">Tümü</SelectItem>
            <SelectItem value="hazirlaniyor">Hazırlanıyor</SelectItem>
            <SelectItem value="kargoda">Kargoda</SelectItem>
            <SelectItem value="teslim">Teslim Edildi</SelectItem>
            <SelectItem value="iptal">İptal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-lg border overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-2">Sipariş</th>
              <th className="px-4 py-2">Tarih</th>
              <th className="px-4 py-2">Tutar</th>
              <th className="px-4 py-2">Durum</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="px-4 py-2 font-medium">{o.id}</td>
                <td className="px-4 py-2">{o.date}</td>
                <td className="px-4 py-2">₺ {(o.total / 100).toLocaleString("tr-TR")}</td>
                <td className="px-4 py-2"><Badge variant="outline">{o.status}</Badge></td>
                <td className="px-4 py-2 text-right"><a className="underline" href="#">Detay</a></td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td className="px-4 py-6 text-muted-foreground" colSpan={5}>Henüz siparişiniz yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


