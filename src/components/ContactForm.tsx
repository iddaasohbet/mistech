"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      setLoading(true);
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Request failed');
      toast.success('Mesajınız alındı. En kısa sürede dönüş sağlayacağız.');
      form.reset();
    } catch (err) {
      toast.error('Gönderim sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input name="name" required placeholder="Ad Soyad" className="border rounded px-3 py-2" />
        <input name="email" required type="email" placeholder="E-posta" className="border rounded px-3 py-2" />
      </div>
      <input name="subject" placeholder="Konu" className="border rounded px-3 py-2" />
      <textarea name="message" required placeholder="Mesajınız" rows={6} className="border rounded px-3 py-2" />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>KVKK / GDPR kapsamında ilettiğiniz bilgiler yalnızca destek amacıyla işlenecektir.</span>
        <Button type="submit" disabled={loading}>{loading ? 'Gönderiliyor...' : 'Gönder'}</Button>
      </div>
    </form>
  );
}


