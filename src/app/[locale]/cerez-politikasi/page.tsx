export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-8 text-sm">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Çerez (Cookie) Politikası</h1>
        <p className="text-muted-foreground">Mistech GmbH • mistech.de</p>
      </header>

      <section className="space-y-2">
        <h2 className="font-medium">Çerez Nedir?</h2>
        <p className="text-muted-foreground">
          Çerezler; web sitesini ziyaret ettiğinizde tarayıcınıza yerleştirilen küçük metin dosyalarıdır. Çerezler sayesinde
          site tercihlerinizi hatırlayabilir, oturumunuzu sürdürebilir ve deneyiminizi iyileştirebiliriz.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Kullandığımız Çerez Türleri</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li><span className="text-foreground">Zorunlu Çerezler:</span> Oturumun sürdürülmesi, sepet ve güvenlik gibi temel işlevler için gereklidir.</li>
          <li><span className="text-foreground">Performans/Analitik Çerezleri:</span> Site kullanımını analiz ederek performansı iyileştirmemize yardımcı olur.</li>
          <li><span className="text-foreground">Pazarlama/Özelleştirme Çerezleri:</span> İlgi alanlarınıza göre içerik ve kampanya gösterimine yardımcı olur.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Çerezlerin Amaçları</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Oturum yönetimi (giriş, sepet, ödeme adımları)</li>
          <li>Güvenlik ve dolandırıcılık önleme</li>
          <li>Site performansını ölçme ve geliştirme</li>
          <li>Tercihlerin hatırlanması (dil/tema vb.)</li>
          <li>Opsiyonel olarak kişiselleştirme ve pazarlama</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Çerez Tercihlerinin Yönetimi</h2>
        <p className="text-muted-foreground">
          Ziyaretiniz sırasında ekranın altında gösterilen bildirim aracılığıyla çerez tercihinizi belirleyebilirsiniz.
          Tercihiniz tarayıcınıza <code className="px-1 py-0.5 rounded bg-muted">cookie_consent</code> adıyla ("accepted"/"declined") kaydedilir.
          Dilediğiniz zaman tarayıcı çerezlerini temizleyebilir veya çerezleri engellemek için tarayıcı ayarlarını
          kullanabilirsiniz. Zorunlu çerezler site işlevleri için gerekli olduğundan kapatılamaz.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Üçüncü Taraflar</h2>
        <p className="text-muted-foreground">
          Ölçümleme ve altyapı sağlayıcılarımız, yürürlükteki mevzuata uygun sözleşmeler ile hizmet sunar. Çerezler üzerinden
          toplanan veriler, istatistiksel analiz ve hizmet kalitesinin artırılması amacıyla işlenebilir.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">İletişim</h2>
        <p className="text-muted-foreground">
          Çerezler ve kişisel verilerin işlenmesine ilişkin sorularınız için: support@mistech.de • +49 1516 4841342
        </p>
      </section>

      <footer className="text-xs text-muted-foreground">
        Yürürlük: {new Date().getFullYear()} • Bu politika gerektiğinde güncellenebilir.
      </footer>
    </div>
  );
}


