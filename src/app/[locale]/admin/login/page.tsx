"use client";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale as string) || "tr";
  const base = `/${locale}`;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password
      });
      if (res?.error) setError("Giriş başarısız. Bilgileri kontrol edin.");
      else window.location.href = `${base}/admin`;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-semibold mb-6">Yönetim Girişi</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">E-posta</label>
          <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="admin@site.com" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Şifre</label>
          <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        {error && <div className="text-sm text-red-500">{error}</div>}
        <Button disabled={submitting} className="w-full" type="submit">
          {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>
      <div className="text-sm text-muted-foreground mt-4">
        Ana sayfaya dön: <a className="underline" href={base}>/</a>
      </div>
    </div>
  );
}



