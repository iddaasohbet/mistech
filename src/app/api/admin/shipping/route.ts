export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const shippingPath = path.join(process.cwd(), "public", "data", "shipping.json");

export async function GET() {
  try {
    const data = await readFile(shippingPath, "utf-8");
    const shipping = JSON.parse(data);
    return NextResponse.json(shipping);
  } catch (error) {
    console.error("Failed to read shipping:", error);
    return NextResponse.json({ 
      methods: [
        {
          id: "selbst-abholen",
          name: "Selbst Abholen",
          description: "Elden teslim - Mağazadan kendiniz teslim alın",
          price: 0,
          estimatedDays: "0",
          enabled: true,
          carrier: "pickup"
        },
        {
          id: "ups-standard",
          name: "UPS Standard",
          description: "UPS ile standart kargo",
          price: 800,
          estimatedDays: "2-3",
          enabled: true,
          carrier: "ups"
        }
      ]
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { methods } = body;

    if (!Array.isArray(methods)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await writeFile(shippingPath, JSON.stringify({ methods }, null, 2), "utf-8");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save shipping:", error);
    return NextResponse.json({ error: "Failed to save shipping" }, { status: 500 });
  }
}


