export default function DistanceSalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-8 text-sm">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Mesafeli Satış Sözleşmesi</h1>
        <p className="text-muted-foreground">Mistech GmbH • mistech.de</p>
      </header>

      <section className="space-y-2">
        <h2 className="font-medium">Taraflar</h2>
        <p className="text-muted-foreground">
          İşbu sözleşme; Satıcı <span className="text-foreground">Mistech GmbH</span> (An der Waidmaar 25A, 50226 Frechen, Germany,
          USt-IdNr.: DE360298919, support@mistech.de, +49 1516 4841342) ile elektronik ortamda sipariş veren Alıcı arasında hüküm ifade eder.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Konu</h2>
        <p className="text-muted-foreground">
          Alıcı'nın, mistech.de üzerinden ürün/ürünleri elektronik ortamda sipariş vermesi ve bedelini ödemesi; ürünlerin Alıcı'ya
          teslimi ile ilgili tarafların hak ve yükümlülüklerini düzenler.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Ürün ve Ödeme</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Ürünlerin temel nitelikleri ve vergiler dâhil toplam satış bedeli sipariş sayfasında gösterilir.</li>
          <li>Ödeme; güvenli ödeme sağlayıcıları üzerinden kredi kartı/banka kartı vb. yöntemlerle alınır.</li>
          <li>Ödeme onayı alınmadıkça sözleşme kurulmuş sayılmaz.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Teslimat</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Ürünler, stok durumuna göre en kısa sürede kargoya verilir ve Alıcı'nın bildirdiği adrese teslim edilir.</li>
          <li>Taşıma/kargo süreçlerinde oluşabilecek gecikmelerden kargo firması sorumludur.</li>
          <li>Alıcı, teslim sırasında paketi kontrol ederek hasar durumunda tutanak tutturmakla yükümlüdür.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Cayma Hakkı</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Alıcı, teslim tarihinden itibaren 14 gün içinde hiçbir gerekçe göstermeksizin cayma hakkına sahiptir.</li>
          <li>Hijyen, kişisel kullanım veya hızla bozulma riski olan ürünlerde cayma hakkı sınırlı olabilir.</li>
          <li>İade için ürünün orijinal ambalajı ve aksesuarları ile birlikte, kullanılmamış/hasarsız olması gerekir.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">İade Süreci</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>İade talebi support@mistech.de üzerinden iletilir.</li>
          <li>Ürün iade onayından sonra tarafınıza gönderilecek adrese, anlaşmalı kargo ile gönderilir.</li>
          <li>İade onaylandığında bedel; ödeme yönteminize göre makul süre içinde iade edilir.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Garanti ve Destek</h2>
        <p className="text-muted-foreground">Ürünler üretici/dağıtıcı kapsamındaki yasal garanti hükümlerine tabidir. Destek için bizimle iletişime geçebilirsiniz.</p>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Uygulanacak Hukuk ve Uyuşmazlık Çözümü</h2>
        <p className="text-muted-foreground">İşbu sözleşme ilgili ülke mevzuatına tabidir. Uyuşmazlıklar öncelikle müzakere ile; mümkün olmazsa yetkili merciler nezdinde çözülür.</p>
      </section>

      <footer className="text-xs text-muted-foreground">Yürürlük: {new Date().getFullYear()}</footer>
    </div>
  );
}


