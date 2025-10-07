import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      email, 
      password, 
      name,
      companyName,
      taxNumber,
      phone,
      address
    } = body as { 
      email?: string; 
      password?: string; 
      name?: string;
      companyName?: string;
      taxNumber?: string;
      phone?: string;
      address?: string;
    };
    
    // Validate required fields
    if (!email || !password || !name || !companyName || !taxNumber || !phone) {
      return NextResponse.json({ error: "Lütfen tüm zorunlu alanları doldurun" }, { status: 400 });
    }
    
    const exists = await (prisma as any).user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: "Bu e-posta zaten kayıtlı" }, { status: 409 });
    
    const hashed = await hash(password, 10);
    const user = await (prisma as any).user.create({ 
      data: { 
        email, 
        name,
        password: hashed,
        companyName,
        taxNumber,
        phone,
        companyAddress: address ?? null,
        role: "customer" // New B2B customers start as "customer" and need approval
      } 
    });
    
    return NextResponse.json({ 
      ok: true, 
      user: { 
        id: user.id, 
        email: user.email,
        companyName: user.companyName 
      } 
    });
  } catch (e) {
    console.error("Registration error:", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}


