import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  try {
    const reviews = await (prisma as any).review.findMany({
      where: { productId, approved: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ reviews });
  } catch (err) {
    // DB unavailable/misconfigured in dev – fail soft with empty list
    return NextResponse.json({ reviews: [], error: "db_unavailable" }, { status: 200 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const { productId, content, rating } = body || {};
  if (!productId || !content || typeof rating !== "number") {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) return NextResponse.json({ error: "rating out of range" }, { status: 400 });
  try {
    const review = await (prisma as any).review.create({
      data: {
        productId,
        rating,
        content,
        approved: false,
        author: (session.user.name as string) || (session.user.email as string) || "Kullanıcı",
      },
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
}


