"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, LogIn, UserPlus, LogOut } from "lucide-react";

export default function AuthMenu({ base }: { base: string }) {
  const { data: session } = useSession();
  const t = useTranslations('auth');
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('myAccount')} className="text-white hover:text-white bg-white/0 hover:bg-white/10 border border-white/10">
          <User className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {session?.user ? (
          <>
            <DropdownMenuItem asChild>
              <Link href={`${base}/hesap`}>
                <User className="mr-2 size-4" /> {t('myAccount')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: base })}>
              <LogOut className="mr-2 size-4" /> {t('logout')}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href={`${base}/giris`}>
                <LogIn className="mr-2 size-4" /> {t('login')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`${base}/kayit`}>
                <UserPlus className="mr-2 size-4" /> {t('register')}
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


