export default function AddressesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Adresler</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4 bg-card">
          <div className="font-medium mb-2">Teslimat Adresi</div>
          <div className="text-sm text-muted-foreground mb-3">Teslimat için kullanılacak adres.</div>
          <form className="grid gap-2">
            <input name="fullName" className="border rounded px-3 py-2" placeholder="Ad Soyad" />
            <input name="phone" className="border rounded px-3 py-2" placeholder="Telefon" />
            <textarea name="line" className="border rounded px-3 py-2" placeholder="Adres" rows={3} />
            <div className="flex gap-2">
              <input name="city" className="border rounded px-3 py-2 w-full" placeholder="İl" />
              <input name="district" className="border rounded px-3 py-2 w-full" placeholder="İlçe" />
            </div>
            <button className="rounded bg-foreground text-background py-2 text-sm" type="button" disabled>Kaydet</button>
          </form>
        </div>
        <div className="rounded-lg border p-4 bg-card">
          <div className="font-medium mb-2">Fatura Adresi</div>
          <div className="text-sm text-muted-foreground mb-3">Fatura için kullanılacak adres.</div>
          <form className="grid gap-2">
            <input name="fullName" className="border rounded px-3 py-2" placeholder="Ad Soyad / Ünvan" />
            <input name="taxid" className="border rounded px-3 py-2" placeholder="Vergi No / TC" />
            <textarea name="line" className="border rounded px-3 py-2" placeholder="Adres" rows={3} />
            <button className="rounded bg-foreground text-background py-2 text-sm" type="button" disabled>Kaydet</button>
          </form>
        </div>
      </div>
    </div>
  );
}


