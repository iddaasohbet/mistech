export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      (prisma as any).user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              favorites: true,
            }
          }
        }
      }),
      (prisma as any).user.count({ where })
    ]);

    // Calculate total spent for each user
    const customersWithSpending = await Promise.all(
      users.map(async (user: any) => {
        const orders = await (prisma as any).order.findMany({
          where: { userId: user.id },
          select: { total: true }
        });
        
        const totalSpent = orders.reduce((sum: number, order: any) => sum + order.total, 0);
        
        return {
          ...user,
          totalSpent
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      customers: customersWithSpending,
      totalPages,
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json({
      customers: [],
      totalPages: 1,
      currentPage: 1,
      total: 0
    });
  }
}


