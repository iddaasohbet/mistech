export const dynamic = "force-static";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await (prisma as any).user.findUnique({ where: { email: session.user.email } });
  const favorites = await (prisma as any).favorite.findMany({ where: { userId: user.id }, include: { product: true } });
  return NextResponse.json({ favorites });
}

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await (prisma as any).user.findUnique({ where: { email: session.user.email } });
  const body = await req.json();
  const created = await (prisma as any).favorite.create({ data: { userId: user.id, productId: body.productId } });
  return NextResponse.json({ favorite: created });
}

export async function DELETE(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await (prisma as any).favorite.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}


