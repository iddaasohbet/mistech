"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function AuthButtons({ base }: { base: string }) {
  const { data: session } = useSession();
  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href={`${base}/hesap`}>Profil</Link>
        </Button>
        <Button onClick={() => signOut({ callbackUrl: base })}>Çıkış</Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" asChild>
        <Link href={`${base}/giris`}>Giriş</Link>
      </Button>
      <Button asChild>
        <Link href={`${base}/kayit`}>Kayıt Ol</Link>
      </Button>
    </div>
  );
}


