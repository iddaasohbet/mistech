export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { trackingNumber, carrier } = body;

    if (!trackingNumber || !carrier) {
      return NextResponse.json({ error: "Tracking number and carrier are required" }, { status: 400 });
    }

    // Update order with tracking info
    const order = await (prisma as any).order.update({
      where: { id },
      data: {
        trackingNumber,
        carrier,
        status: "shipped"
      }
    });

    // TODO: Send email to customer with tracking number

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Failed to add tracking:", error);
    return NextResponse.json({ error: "Failed to add tracking" }, { status: 500 });
  }
}


