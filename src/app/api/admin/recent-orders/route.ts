export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const orders = await (prisma as any).order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { items: true, user: { select: { email: true, name: true } } }
    });
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}




















