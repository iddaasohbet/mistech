export const dynamic = "force-static";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  const session = await getAuthSession();
  if (!session || !(session as any)?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await (prisma as any).user.findUnique({ where: { email: (session as any).user.email } });
  const addresses = await (prisma as any).address.findMany({ where: { userId: user.id } });
  return NextResponse.json({ addresses });
}

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session || !(session as any)?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await (prisma as any).user.findUnique({ where: { email: (session as any).user.email } });
  const body = await req.json();
  const created = await (prisma as any).address.create({
    data: { userId: user.id, ...body },
  });
  return NextResponse.json({ address: created });
}

export async function PUT(req: Request) {
  const session = await getAuthSession();
  if (!session || !(session as any)?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, ...data } = body as any;
  const updated = await (prisma as any).address.update({ where: { id }, data });
  return NextResponse.json({ address: updated });
}

export async function DELETE(req: Request) {
  const session = await getAuthSession();
  if (!session || !(session as any)?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await (prisma as any).address.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}


