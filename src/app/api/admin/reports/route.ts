export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // Note: Auth check temporarily relaxed for development
    // const session = await getServerSession(authOptions as any);
    // if (!session?.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total revenue and orders
    const orders = await (prisma as any).order.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { title: true, brand: true } }
          }
        }
      }
    });

    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
    const totalOrders = orders.length;

    // Unique customers
    const customerIds = new Set(orders.map((o: any) => o.userId));
    const totalCustomers = customerIds.size;

    // Average order value
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Total products
    const totalProducts = await (prisma as any).product.count();

    // Revenue by month
    const revenueByMonth: Record<string, { revenue: number; orders: number }> = {};
    orders.forEach((order: any) => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthName = date.toLocaleDateString("tr-TR", { year: "numeric", month: "long" });
      
      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = { revenue: 0, orders: 0 };
      }
      revenueByMonth[monthKey].revenue += order.total;
      revenueByMonth[monthKey].orders += 1;
    });

    const revenueByMonthArray = Object.entries(revenueByMonth)
      .map(([key, value]) => {
        const [year, month] = key.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        const monthName = date.toLocaleDateString("tr-TR", { year: "numeric", month: "long" });
        return {
          month: monthName,
          revenue: value.revenue,
          orders: value.orders
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));

    // Top products
    const productSales: Record<string, { title: string; brand: string; totalSales: number; orderCount: number }> = {};
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            title: item.product?.title || "Unknown",
            brand: item.product?.brand || "Unknown",
            totalSales: 0,
            orderCount: 0
          };
        }
        productSales[item.productId].totalSales += item.price * item.qty;
        productSales[item.productId].orderCount += item.qty;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);

    // Top customers
    const customerSpending: Record<string, { name: string; email: string; totalSpent: number; orderCount: number }> = {};
    orders.forEach((order: any) => {
      if (!customerSpending[order.userId]) {
        customerSpending[order.userId] = {
          name: order.user?.name || "",
          email: order.user?.email || "",
          totalSpent: 0,
          orderCount: 0
        };
      }
      customerSpending[order.userId].totalSpent += order.total;
      customerSpending[order.userId].orderCount += 1;
    });

    const topCustomers = Object.entries(customerSpending)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Orders by status
    const statusCounts: Record<string, number> = {};
    orders.forEach((order: any) => {
      const status = order.status || "pending";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const ordersByStatus = Object.entries(statusCounts)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      avgOrderValue,
      revenueByMonth: revenueByMonthArray,
      topProducts,
      topCustomers,
      ordersByStatus
    });
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return NextResponse.json({
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      avgOrderValue: 0,
      revenueByMonth: [],
      topProducts: [],
      topCustomers: [],
      ordersByStatus: []
    });
  }
}

