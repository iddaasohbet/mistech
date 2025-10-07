export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const settingsPath = path.join(process.cwd(), "public", "data", "settings.json");

export async function GET() {
  try {
    const data = await readFile(settingsPath, "utf-8");
    const settings = JSON.parse(data);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Failed to read settings:", error);
    return NextResponse.json({ 
      settings: {
        siteName: "Premium Shop",
        siteDescription: "En kaliteli ürünler, en uygun fiyatlar",
        logo: "/logo.png",
        contactEmail: "info@premiumshop.com",
        contactPhone: "+90 (555) 123 45 67",
        contactAddress: "Musterstraße 123, 10115 Berlin, Deutschland",
        socialMedia: {
          facebook: "",
          instagram: "",
          twitter: "",
          linkedin: ""
        },
        currency: "EUR",
        currencySymbol: "€",
        language: "de",
        timezone: "Europe/Berlin",
        metaKeywords: "",
        metaDescription: ""
      }
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await writeFile(settingsPath, JSON.stringify(settings, null, 2), "utf-8");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}


