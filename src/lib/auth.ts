import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any) as any,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await (prisma as any).user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) return null;
        const ok = await compare(credentials.password, user.password);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        (session.user as any).id = token.id;
        session.user?.email && ((session.user.email = token.email));
        session.user?.name && ((session.user.name = token.name));
      }
      return session;
    }
  }
};

export async function getAuthSession() {
  return getServerSession(authOptions as any) as any;
}


