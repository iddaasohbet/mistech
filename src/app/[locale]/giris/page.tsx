"use client";
import { FormEvent, useState, use } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const base = `/${locale}`;
  const t = useTranslations('pages.login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", { redirect: false, email, password });
    if (res?.error) setError(t('error'));
    else window.location.href = base;
  }

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
          <ShieldCheck className="size-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Card className="mb-4 border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Building2 className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-200">{t('description')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('email')}</label>
              <input 
                className="w-full border rounded-md px-3 py-2" 
                placeholder="info@mistech.de" 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('password')}</label>
              <input 
                className="w-full border rounded-md px-3 py-2" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            <Button type="submit" size="lg" className="w-full">
              {t('submit')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground mt-6">
        {t('noAccount')} <Link href={`${base}/kayit`} className="font-medium underline">{t('registerLink')}</Link>
      </div>
    </div>
  );
}


