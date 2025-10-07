export default function InvoicePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Fatura Bilgileri</h1>
      <div className="rounded-lg border p-4 bg-card grid gap-3">
        <div className="grid md:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Ünvan" />
          <input className="border rounded px-3 py-2" placeholder="Vergi No" />
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Vergi Dairesi" />
          <input className="border rounded px-3 py-2" placeholder="E-posta" />
        </div>
        <textarea className="border rounded px-3 py-2" placeholder="Fatura Adresi" rows={3} />
        <button className="rounded bg-foreground text-background py-2 text-sm w-max">Kaydet</button>
      </div>
    </div>
  );
}


