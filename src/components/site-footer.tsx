"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, Phone, MapPin, ArrowRight, Instagram, Facebook, Twitter, Youtube, Linkedin, MessageCircle } from "lucide-react";

export function SiteFooter({ locale = "tr" }: { locale?: string }) {
  const t = useTranslations('footer');
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<null | boolean>(null);

  async function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setSent(null);
    try {
      const r = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      setSent(r.ok);
    } catch {
      setSent(false);
    }
  }

  return (
    <footer className="mt-20 border-t bg-white text-foreground">
      {/* Main footer links - light theme, long height */}
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-10 md:grid-cols-5 text-sm text-muted-foreground">
        <div className="col-span-2">
          <div className="font-semibold text-foreground">
            <Image src="https://hizliresimle.com/i/i68e13e6f862eb" alt="logo" width={150} height={36} className="h-9 w-auto" />
          </div>
          <p className="mt-3 leading-relaxed">{t('description')}</p>
          <div className="mt-4 space-y-2">
            <p className="flex items-center gap-2"><MapPin className="size-4" /> Frechen, Germany</p>
            <p className="flex items-center gap-2"><Phone className="size-4" /> +49 151 64841342</p>
            <p className="flex items-center gap-2"><Mail className="size-4" /> info@mistech.de</p>
          </div>
          {/* Social media */}
          <div className="mt-6">
            <div className="text-sm font-medium text-foreground mb-2">Sosyal Medya</div>
            <div className="flex flex-wrap items-center gap-2">
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="inline-flex items-center justify-center size-9 rounded-full border hover:bg-neutral-50 transition">
                <Instagram className="size-4" />
              </a>
              <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="inline-flex items-center justify-center size-9 rounded-full border hover:bg-neutral-50 transition">
                <Facebook className="size-4" />
              </a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X" className="inline-flex items-center justify-center size-9 rounded-full border hover:bg-neutral-50 transition">
                <Twitter className="size-4" />
              </a>
              <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="inline-flex items-center justify-center size-9 rounded-full border hover:bg-neutral-50 transition">
                <Youtube className="size-4" />
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="inline-flex items-center justify-center size-9 rounded-full border hover:bg-neutral-50 transition">
                <Linkedin className="size-4" />
              </a>
              <a href="https://wa.me/4915164841342" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="inline-flex items-center justify-center size-9 rounded-full border hover:bg-neutral-50 transition">
                <MessageCircle className="size-4" />
              </a>
            </div>
          </div>
          {/* App badges */}
          {/* app badges removed */}
        </div>
        <div>
          <div className="font-medium text-foreground">{t('customer')}</div>
          <ul className="mt-3 space-y-2">
            <li><Link href={`/${locale}/hesap/siparisler`}>{t('orderTracking')}</Link></li>
            <li><Link href={`/${locale}/hakkimizda`}>{t('warranty')}</Link></li>
            <li><Link href={`/${locale}/hakkimizda`}>{t('returns')}</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium text-foreground">{t('corporate')}</div>
          <ul className="mt-3 space-y-2">
            <li><Link href={`/${locale}/hakkimizda`}>{t('about')}</Link></li>
            <li><Link href={`/${locale}/iletisim`}>{t('contact')}</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium text-foreground">{t('legal')}</div>
          <ul className="mt-3 space-y-2">
            <li><Link href={`/${locale}/kvkk`}>{t('privacy')}</Link></li>
            <li><Link href={`/${locale}/cerez-politikasi`}>{t('cookies')}</Link></li>
            <li><Link href={`/${locale}/mesafeli-satis`}>{t('distanceSelling')}</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ backgroundColor: '#051e22', color: 'white' }}>
        <div className="mx-auto max-w-7xl px-6 py-8 text-xs">
          <p className="text-white/80">{t('siteDescription')}</p>
        </div>
      </div>

      {/* Premium Developer Credit */}
      <div className="bg-white border-t">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="text-center">
            <p className="text-sm text-slate-600">
              {t('developedBy')} 
              <a 
                href="https://cihatsoft.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 inline-flex items-center gap-1 font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                cihatsoft.com
                <ArrowRight className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}


