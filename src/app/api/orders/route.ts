export const dynamic = "force-static";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await (prisma as any).user.findUnique({ where: { email: session.user.email } });
  const orders = await (prisma as any).order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ orders });
}


