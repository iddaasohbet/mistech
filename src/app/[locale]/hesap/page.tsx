export default function AccountHome() {
  const recent = Array.from({ length: 3 }).map((_, i) => ({
    id: `SIP-${1000 + i}`,
    date: "2025-09-28",
    total: 129999,
    status: "Hazırlanıyor",
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Hesabım</div>
          <h1 className="text-2xl font-semibold tracking-tight">Genel Bakış</h1>
        </div>
        <a href="./ayarlar" className="text-sm underline">Hesap ayarları</a>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 bg-card">
          <div className="text-sm text-muted-foreground">Toplam Sipariş</div>
          <div className="text-3xl font-semibold">0</div>
        </div>
        <div className="rounded-lg border p-4 bg-card">
          <div className="text-sm text-muted-foreground">Bekleyen Ödeme</div>
          <div className="text-3xl font-semibold">0</div>
        </div>
        <div className="rounded-lg border p-4 bg-card">
          <div className="text-sm text-muted-foreground">İade Talebi</div>
          <div className="text-3xl font-semibold">0</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-lg border overflow-hidden">
          <div className="px-4 py-3 border-b font-medium">Son Siparişler</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-2">Sipariş</th>
                <th className="px-4 py-2">Tarih</th>
                <th className="px-4 py-2">Tutar</th>
                <th className="px-4 py-2">Durum</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2"><a className="underline" href={`./siparisler`}>{r.id}</a></td>
                  <td className="px-4 py-2">{r.date}</td>
                  <td className="px-4 py-2">₺ {(r.total / 100).toLocaleString("tr-TR")}</td>
                  <td className="px-4 py-2">{r.status}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td className="px-4 py-6 text-muted-foreground" colSpan={4}>Henüz siparişiniz yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border p-4 grid gap-4">
          <div>
            <div className="font-medium">Kayıtlı Adresler</div>
            <div className="text-sm text-muted-foreground">Teslimat ve fatura adreslerinizi yönetin.</div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded border p-3">
              <div className="text-sm font-medium">Teslimat Adresi</div>
              <div className="text-xs text-muted-foreground">Henüz adres eklenmedi.</div>
              <a className="text-xs underline mt-2 inline-block" href="./adresler">Düzenle</a>
            </div>
            <div className="rounded border p-3">
              <div className="text-sm font-medium">Fatura Adresi</div>
              <div className="text-xs text-muted-foreground">Henüz adres eklenmedi.</div>
              <a className="text-xs underline mt-2 inline-block" href="./fatura">Düzenle</a>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="font-medium mb-2">Güvenlik</div>
        <div className="text-sm text-muted-foreground">Şifre, iki adımlı doğrulama (2FA) ve oturumlarınızı yönetin (yakında).</div>
      </div>
    </div>
  );
}

