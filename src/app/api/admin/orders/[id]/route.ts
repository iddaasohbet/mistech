export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Note: Auth check temporarily relaxed for development
    // const session = await getServerSession(authOptions as any);
    // if (!session?.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await (prisma as any).order.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { email: true, name: true } },
        items: {
          include: {
            product: { select: { title: true, brand: true } }
          }
        }
      }
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Note: Auth check temporarily relaxed for development
    // const session = await getServerSession(authOptions as any);
    // if (!session?.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { id } = await params;

    const order = await (prisma as any).order.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true, id: true } },
        items: {
          include: {
            product: { select: { title: true, brand: true, images: true, slug: true } }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

