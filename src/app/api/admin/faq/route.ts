export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const faqPath = path.join(process.cwd(), "public", "data", "faq.json");

export async function GET() {
  try {
    const data = await readFile(faqPath, "utf-8");
    const faqs = JSON.parse(data);
    return NextResponse.json({ faqs });
  } catch (error) {
    console.error("Failed to read FAQ:", error);
    return NextResponse.json({ faqs: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { faqs } = body;

    if (!Array.isArray(faqs)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await writeFile(faqPath, JSON.stringify(faqs, null, 2), "utf-8");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save FAQ:", error);
    return NextResponse.json({ error: "Failed to save FAQ" }, { status: 500 });
  }
}


