export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const integrationsPath = path.join(process.cwd(), "public", "data", "integrations.json");

export async function GET() {
  try {
    const data = await readFile(integrationsPath, "utf-8");
    const integrations = JSON.parse(data);
    return NextResponse.json(integrations);
  } catch (error) {
    console.error("Failed to read integrations:", error);
    return NextResponse.json({ integrations: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { integrations } = body;

    if (!Array.isArray(integrations)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await writeFile(integrationsPath, JSON.stringify({ integrations }, null, 2), "utf-8");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save integrations:", error);
    return NextResponse.json({ error: "Failed to save integrations" }, { status: 500 });
  }
}


