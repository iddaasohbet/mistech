import { Phone, Mail, MapPin } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export default async function ContactPage({ params }: { params: Promise<{ locale?: string }> }) {
  const resolved = await params;
  const locale = resolved?.locale || "tr";
  const messages = (await import(`@/messages/${locale}.json`)).default as any;
  const t = messages.pages.contact;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{t.description}</p>
          <div className="rounded-lg border p-5 bg-card text-sm">
            <div className="flex items-center gap-2"><Phone className="size-4"/> +49 1516 4841342</div>
            <div className="flex items-center gap-2 mt-2"><Mail className="size-4"/> support@mistech.de</div>
            <div className="flex items-start gap-2 mt-2"><MapPin className="size-4 mt-0.5"/> An der Waidmaar 25A, 50226 Frechen, Germany</div>
            <div className="mt-3 text-xs text-muted-foreground">WhatsApp: <a className="underline" href="https://wa.me/4915164841342" target="_blank">{t.whatsappNow}</a></div>
          </div>
        </div>
        <div className="rounded-lg border p-5 bg-card">
          <div className="font-medium mb-3">{t.writeToUs}</div>
          <ContactForm />
        </div>
      </div>
      <div className="rounded-lg border overflow-hidden">
        <iframe
          title="Mistech GmbH"
          className="w-full h-[360px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={"https://www.google.com/maps?q=An%20der%20Waidmaar%2025A%2C%2050226%20Frechen%2C%20Germany&output=embed"}
        />
      </div>
    </div>
  );
}


