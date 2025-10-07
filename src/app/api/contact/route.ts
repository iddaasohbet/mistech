import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  // In real-world, forward to email, CRM or ticket system
  console.log("CONTACT_FORM", body);
  return NextResponse.json({ ok: true });
}


