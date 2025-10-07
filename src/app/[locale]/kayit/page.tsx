"use client";
import { FormEvent, useState, use } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const base = `/${locale}`;
  const t = useTranslations('pages.register');
  const inputCls = "w-full border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-[#051e22]/30 focus:border-[#051e22] placeholder:text-muted-foreground/60";
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk(false);
    
    // Validate required fields
    if (!name || !email || !password || !companyName || !taxNumber || !phone) {
      setError(t('requiredField'));
      return;
    }
    
    const res = await fetch("/api/register", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ 
        email, 
        password, 
        name,
        companyName,
        taxNumber,
        phone,
        address
      }) 
    });
    
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || t('error'));
      return;
    }
    setOk(true);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
          <Building2 className="size-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Card className="mb-6 border-[#051e22]/20 bg-[#051e22]/5 dark:bg-[#051e22]/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="size-5 text-[#051e22] flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">{t('description')}</p>
              <p className="text-muted-foreground">{t('b2bNotice')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm ring-1 ring-black/5">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="size-5" />
                  {t('companyInfo')}
                </h3>
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t('companyName')} *</label>
                    <input 
                      className={inputCls}
                      placeholder="Mistech GmbH" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">{t('taxNumber')} *</label>
                      <input 
                        className={inputCls}
                        placeholder="DE123456789" 
                        value={taxNumber} 
                        onChange={(e) => setTaxNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">{t('phone')} *</label>
                      <input 
                        className={inputCls}
                        placeholder="+49 151 64841342" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t('address')}</label>
                    <textarea 
                      className={`${inputCls} min-h-[100px]`}
                      placeholder="An der Waidmaar 25A, 50226 Frechen, Germany" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('personalInfo')}</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t('name')} *</label>
                    <input 
                      className={inputCls}
                      placeholder="Behcet Yildiran" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t('email')} *</label>
                    <input 
                      className={inputCls}
                      placeholder="info@mistech.de" 
                      type="email"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t('password')} *</label>
                    <input 
                      className={inputCls}
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            {ok && (
              <div className="rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-3">
                <p className="text-sm text-green-600 dark:text-green-400">{t('success')}</p>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full bg-[#051e22] hover:bg-[#051e22]/90">
              {t('submit')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground mt-6">
        {t('hasAccount')} <Link href={`${base}/giris`} className="font-medium underline">{t('loginLink')}</Link>
      </div>
    </div>
  );
}


