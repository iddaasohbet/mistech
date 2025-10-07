export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { readCart, writeCart, type CartProduct } from "@/lib/cart";
import { prisma } from "@/lib/db";
import { findImportedProductBySlug, buildImportedSlug } from "@/lib/imports";

export async function GET() {
  const cart = await readCart();
  const products = await (prisma as any).product.findMany({
    where: { id: { in: cart.items.map((x) => x.productId) } },
  });
  const items = cart.items.map((ci) => ({
    qty: ci.qty,
    product: products.find((p: any) => p.id === ci.productId),
  }));
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, qty, product } = body as { productId?: string; qty?: number; product?: CartProduct };
    const pid = productId ?? product?.id;
    if (!pid) return NextResponse.json({ error: "productId required" }, { status: 400 });
    const cart = await readCart();
    const current = cart.items.find((x) => x.productId === pid);
    if (current) {
      current.qty += qty ?? 1;
      if (product) current.product = product;
    } else {
      cart.items.push({ productId: pid, qty: qty ?? 1, product });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set("cart", JSON.stringify(cart), { httpOnly: false, sameSite: "lax", path: "/", maxAge: 60*60*24*30 });
    return res;
  } catch (e) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { productId, qty } = body as { productId: string; qty: number };
  const cart = await readCart();
  const item = cart.items.find((x) => x.productId === productId);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  item.qty = Math.max(1, qty);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("cart", JSON.stringify(cart), { httpOnly: false, sameSite: "lax", path: "/", maxAge: 60*60*24*30 });
  return res;
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const cart = await readCart();
  const next = { items: cart.items.filter((x) => x.productId !== productId) };
  const res = NextResponse.json({ ok: true });
  res.cookies.set("cart", JSON.stringify(next), { httpOnly: false, sameSite: "lax", path: "/", maxAge: 60*60*24*30 });
  return res;
}


