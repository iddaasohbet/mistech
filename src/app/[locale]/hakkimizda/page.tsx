import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, ShieldCheck, Truck, Star, CheckCircle2 } from "lucide-react";

export default async function AboutPage({ params }: { params: Promise<{ locale?: string }> }) {
  const resolved = await params;
  const locale = resolved?.locale || "tr";
  const messages = (await import(`@/messages/${locale}.json`)).default as any;
  const t = messages.pages.about;
  const tp = messages.product;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border bg-card">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.05),transparent_60%)]" />
        <div className="relative p-8 md:p-12 grid gap-6 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{t.title}</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {t.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1"><ShieldCheck className="size-3" /> {tp.guarantee}</Badge>
              <Badge variant="outline" className="gap-1"><Truck className="size-3" /> {tp.fastShipping}</Badge>
              <Badge variant="outline" className="gap-1"><Star className="size-3" /> {tp.warranty}</Badge>
            </div>
          </div>
          <div className="rounded-lg border bg-background p-5 text-sm">
            <div className="font-medium text-foreground mb-3">{t.companyInfo}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <div className="text-muted-foreground">{t.authorized}</div><div>Behcet Yildiran</div>
              <div className="text-muted-foreground">{t.company}</div><div>Mistech GmbH</div>
              <div className="text-muted-foreground">{t.taxNumber}</div><div>DE360298919</div>
              <div className="text-muted-foreground">{t.phone}</div><div>+49 1516 4841342</div>
              <div className="text-muted-foreground">{t.address}</div>
              <div>
                An der Waidmaar 25A<br/>
                50226 Frechen<br/>
                Germany
              </div>
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" size="sm"><a href="https://wa.me/4915164841342" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2"><Phone className="size-4"/> {t.whatsapp}</a></Button>
            </div>
          </div>
        </div>
      </section>

      {/* KPI */}
      <section className="grid gap-4 md:grid-cols-4">
        {[{label:t.happyCustomers,value:"10K+"},{label:t.productsSent,value:"50K+"},{label:t.returnRate,value:"%1.2"},{label:t.rating,value:"4.8/5"}].map((k)=> (
          <div key={k.label} className="rounded-lg border bg-card p-5">
            <div className="text-2xl font-semibold">{k.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
          </div>
        ))}
      </section>

      {/* Mission/Vision/Values */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border p-5 bg-card">
          <div className="font-medium mb-1">{t.mission}</div>
          <p className="text-sm text-muted-foreground">{t.missionText}</p>
        </div>
        <div className="rounded-lg border p-5 bg-card">
          <div className="font-medium mb-1">{t.vision}</div>
          <p className="text-sm text-muted-foreground">{t.visionText}</p>
        </div>
        <div className="rounded-lg border p-5 bg-card">
          <div className="font-medium mb-1">{t.values}</div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-2"><CheckCircle2 className="size-4"/> {t.transparency}</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="size-4"/> {t.authenticity}</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="size-4"/> {t.fastSupport}</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="size-4"/> {t.customerSatisfaction}</li>
          </ul>
        </div>
      </section>

      

      {/* Map */}
      <section className="rounded-lg border overflow-hidden">
        <iframe
          title="Mistech GmbH"
          className="w-full h-[360px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={"https://www.google.com/maps?q=An%20der%20Waidmaar%2025A%2C%2050226%20Frechen%2C%20Germany&output=embed"}
        />
      </section>
    </div>
  );
}


