import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = (locale as string | undefined) ?? "tr";
  const messages = (await import(`../messages/${resolvedLocale}.json`)).default;
  return { locale: resolvedLocale, messages };
});


