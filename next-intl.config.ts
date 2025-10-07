import { locales, defaultLocale } from "./src/app/i18n";

export default {
  locales,
  defaultLocale,
  messages: {
    async getMessages({ locale }: { locale: string }) {
      return (await import(`./src/messages/${locale}.json`)).default;
    }
  }
};


