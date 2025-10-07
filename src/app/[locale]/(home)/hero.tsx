"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface HeroProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  gradientType?: 'skyblue' | 'ocean' | 'sunset' | 'forest' | 'purple';
  animationSpeed?: number;
}

export function Hero(props: HeroProps) {
  const { title, subtitle, ctaLabel, ctaHref } = props;
  const t = useTranslations('hero');

  return (
    <section
      className="relative border-b"
      style={{
        backgroundImage: 'url("https://euromobilecompany.de/image/cache/catalog/emc/banners/home/banner-emc-phone-repair-1600x416.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-24 text-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
          {title}
        </h1>
        <p className="mt-3 text-base md:text-lg text-white/80">
          {subtitle}
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
            <a href={ctaHref}>{t('exploreProducts')}</a>
          </Button>
          <Button asChild variant="outline" size="lg" className="backdrop-blur bg-white/10 text-white border-white/40 hover:bg-white/20">
            <a href="https://wa.me/4915164841342" target="_blank" rel="noopener noreferrer">{t('quickContact')}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}


