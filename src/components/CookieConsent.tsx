"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type Status = "accepted" | "declined" | undefined;

export default function CookieConsent({ initial }: { initial?: Status }) {
  const [visible, setVisible] = useState<Status>(initial);
  const t = useTranslations('cookie');

  useEffect(() => {
    // If cookie not set on server, double-check on client
    if (typeof document !== "undefined" && initial === undefined) {
      const ck = document.cookie.split("; ").find((x) => x.startsWith("cookie_consent="));
      if (ck) setVisible((ck.split("=")[1] as Status) ?? undefined);
    }
  }, [initial]);

  if (visible) return null;

  function setConsent(value: Exclude<Status, undefined>) {
    const oneYear = 365 * 24 * 60 * 60;
    document.cookie = `cookie_consent=${value}; Max-Age=${oneYear}; Path=/; SameSite=Lax`;
    setVisible(value);
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="w-full max-w-3xl rounded-lg border bg-background shadow-lg p-4 md:p-5">
        <div className="md:flex md:items-center md:justify-between md:gap-6">
          <div className="text-sm text-muted-foreground">
            {t('message')}
          </div>
          <div className="mt-3 md:mt-0 flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setConsent("declined")}>{t('decline')}</Button>
            <Button size="sm" onClick={() => setConsent("accepted")}>{t('accept')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}


