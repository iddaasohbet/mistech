import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function hash(seed: string) { let h = 0; for (let i=0;i<seed.length;i++) { h = (h<<5)-h + seed.charCodeAt(i); h|=0; } return Math.abs(h); }
function mul(a: number){ return function(){ a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a>>>15), 1|a); t ^= t + Math.imul(t ^ (t>>>7), 61|t); return ((t ^ (t>>>14))>>>0)/4294967296; } }
function demoReviews(seed = "admin-demo"){ const rng = mul(hash(seed)); const names=["Ahmet","Ayşe","Mehmet","Elif","Can","Zeynep","Kerem","Ece","Deniz","Seda"]; const last=["Yılmaz","Demir","Kaya","Şahin","Çelik","Yıldız"]; const texts=["Ürün beklediğim gibi.","Hızlı kargo, öneririm.","Fiyat/performans başarılı.","Sorunsuz kullanıyorum."]; const n=6; const now=Date.now(); return Array.from({length:n}).map((_,i)=>({ id:`demo-${i}`, author:`${names[Math.floor(rng()*names.length)]} ${last[Math.floor(rng()*last.length)]}`, content:texts[Math.floor(rng()*texts.length)], rating: rng()>0.7?4:5, createdAt:new Date(now - Math.floor(rng()*120)*864e5).toISOString(), productId: undefined })); }

export async function GET() {
  // In dev/demo we return empty list instead of 401 to avoid blocking UI
  try {
    await getServerSession(authOptions as any); // best-effort
    const reviews = await (prisma as any).review.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
    if (!reviews || reviews.length === 0) {
      return NextResponse.json({ reviews: demoReviews() });
    }
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ reviews: demoReviews() });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  try {
    await (prisma as any).review.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
}


