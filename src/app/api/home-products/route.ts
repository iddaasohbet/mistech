import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEMO_EXPORT } from "@/lib/demo";

export const dynamic = "force-static";
export const revalidate = 0;

export async function GET() {
  if (DEMO_EXPORT) {
    try {
      const res = await fetch("/data/products.json");
      const products = await res.json();
      return NextResponse.json({ products });
    } catch (e) {
      return NextResponse.json({ products: [] });
    }
  }
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 8
  });
  return NextResponse.json({ products });
}


