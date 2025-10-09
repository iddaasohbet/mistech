import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Note: Loosen the type of the second argument to avoid TS incompatibility across Next.js versions
export async function PATCH(_req: Request, context: any) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await _req.json();
    const { content, rating, approved } = body || {};
    const id = context?.params?.id as string;
    const review = await (prisma as any).review.update({ where: { id }, data: { content, rating, approved } });
    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 400 });
  }
}


