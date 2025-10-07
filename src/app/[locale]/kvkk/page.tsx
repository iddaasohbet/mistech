export default function KvkkPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-8 text-sm">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">KVKK / GDPR Aydınlatma Metni</h1>
        <p className="text-muted-foreground">Mistech GmbH • mistech.de</p>
      </header>

      <section className="rounded-lg border bg-card p-5 space-y-3">
        <h2 className="font-medium">Veri Sorumlusu</h2>
        <p>
          Veri Sorumlusu: Mistech GmbH ("Şirket")
          <br /> Adres: An der Waidmaar 25A, 50226 Frechen, Germany
          <br /> İletişim: support@mistech.de • +49 1516 4841342
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">İşlenen Kişisel Veri Kategorileri</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Kimlik ve iletişim bilgileri (ad, soyad, e‑posta, telefon)</li>
          <li>Müşteri işlem bilgileri (sipariş, fatura, iade, destek kayıtları)</li>
          <li>Ödeme bilgileri (maske/son 4 hane, işlem referansı – kartın kendisi saklanmaz)</li>
          <li>Adres bilgileri (teslimat ve fatura adresi)</li>
          <li>Teknik veriler (IP, cihaz/tarayıcı bilgisi, kullanım ve çerez verileri)</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">İşleme Amaçları ve Hukuki Sebepler</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Sözleşmenin kurulması/ifası: sipariş oluşturma, teslimat, iade süreçleri</li>
          <li>Hukuki yükümlülük: faturalama, muhasebe, kayıtların saklanması</li>
          <li>Meşru menfaat: dolandırıcılık önleme, altyapı güvenliği, hizmet iyileştirme</li>
          <li>Açık rıza: ticari iletişim ve pazarlama tercihleri, isteğe bağlı çerezler</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Aktarım ve Alıcı Grupları</h2>
        <p className="text-muted-foreground">
          Hizmet sağlayıcılarımızla (barındırma, kargo, ödeme kuruluşları, teknik destek, analitik) veri işleme sözleşmeleri
          kapsamında çalışıyoruz. Gerekli hallerde veriler AB/AEA içinde veya yeterlilik kararı kapsamındaki ülkelere aktarılabilir.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Saklama Süreleri</h2>
        <p className="text-muted-foreground">
          Sipariş ve faturalama kayıtları ilgili mevzuat uyarınca asgari yasal süre boyunca; hesap ve destek kayıtları ise
          meşru menfaat ve sözleşme ilişkisi sürdükçe saklanır. Süre sonunda güvenli şekilde silinir veya anonim hale getirilir.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Haklarınız</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Erişim, düzeltme, silme, kısıtlama, itiraz, veri taşınabilirliği</li>
          <li>Açık rızayı dilediğiniz zaman geri alma</li>
          <li>Yetkili denetim otoritesine şikâyet hakkı</li>
        </ul>
        <p className="text-muted-foreground">Talepleriniz için: support@mistech.de</p>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Çerezler ve Benzer Teknolojiler</h2>
        <p className="text-muted-foreground">
          Zorunlu çerezler sitemizin çalışması için gereklidir. Analitik ve pazarlama çerezleri tercihinize bağlıdır ve
          çerez bildirimi aracılığıyla yönetebilirsiniz. Ayrıntılar "Çerez Politikası" sayfasında yer alır.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Güvenlik</h2>
        <p className="text-muted-foreground">Kişisel veriler; kriptografi, erişim kontrolü, kayıt yönetimi ve düzenli denetimlerle korunur.</p>
      </section>

      <footer className="text-xs text-muted-foreground">
        Yürürlük: {new Date().getFullYear()} • Bu metin gerektiğinde güncellenebilir.
      </footer>
    </div>
  );
}


