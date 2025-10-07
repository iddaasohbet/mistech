import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { locales, Locale } from "../i18n";
import { ThemeProvider } from "@/components/theme-provider";
import Providers from "../providers";
import SiteChrome from "@/components/SiteChrome";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = (locale as "tr" | "en" | "de" | undefined) ?? "tr";
  if (!locales.includes(validLocale)) return notFound();
  const messages = (await import(`../../messages/${validLocale}.json`)).default;

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        <ThemeProvider>
          <SiteChrome locale={locale}>{children}</SiteChrome>
        </ThemeProvider>
      </Providers>
    </NextIntlClientProvider>
  );
}


