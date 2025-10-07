export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Ayarlar</h1>
      <div className="rounded border p-4">
        <div className="font-medium mb-2">Profil Bilgileri</div>
        <form className="grid md:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Ad Soyad" />
          <input className="border rounded px-3 py-2" placeholder="E-posta" />
          <button className="rounded bg-foreground text-background py-2 text-sm w-max">Kaydet</button>
        </form>
      </div>
      <div className="rounded border p-4">
        <div className="font-medium mb-2">Güvenlik</div>
        <form className="grid md:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Mevcut Şifre" type="password" />
          <input className="border rounded px-3 py-2" placeholder="Yeni Şifre" type="password" />
          <button className="rounded bg-foreground text-background py-2 text-sm w-max">Şifreyi Güncelle</button>
        </form>
      </div>
      <div className="rounded border p-4">
        <div className="font-medium mb-2">İletişim Tercihleri</div>
        <div className="text-sm text-muted-foreground">E-posta bildirimlerini yönet. (yakında)</div>
      </div>
    </div>
  );
}


