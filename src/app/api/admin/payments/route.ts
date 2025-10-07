export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const paymentsPath = path.join(process.cwd(), "public", "data", "payments.json");

export async function GET() {
  try {
    const data = await readFile(paymentsPath, "utf-8");
    const payments = JSON.parse(data);
    return NextResponse.json(payments);
  } catch (error) {
    console.error("Failed to read payments:", error);
    return NextResponse.json({ 
      methods: [
        {
          id: "bank-transfer",
          name: "Havale/IBAN",
          description: "Banka havalesi ile ödeme",
          type: "bank_transfer",
          enabled: true,
          icon: "bank",
          config: {
            bankName: "Deutsche Bank",
            iban: "DE89 3704 0044 0532 0130 00",
            bic: "COBADEFFXXX",
            accountHolder: "Premium Shop GmbH"
          }
        },
        {
          id: "cash-on-pickup",
          name: "Barzahlung bei Abholung",
          description: "Elden teslimde nakit ödeme",
          type: "cash",
          enabled: true,
          icon: "cash",
          config: {}
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

    await writeFile(paymentsPath, JSON.stringify({ methods }, null, 2), "utf-8");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save payments:", error);
    return NextResponse.json({ error: "Failed to save payments" }, { status: 500 });
  }
}


