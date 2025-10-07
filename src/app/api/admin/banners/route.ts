import { NextResponse } from "next/server";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const FILE_PATH = path.join(process.cwd(), "public", "data", "home-banners.json");

export async function GET() {
  try {
    const raw = await readFile(FILE_PATH, "utf8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    await writeFile(FILE_PATH, JSON.stringify(body, null, 2), "utf8");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}


