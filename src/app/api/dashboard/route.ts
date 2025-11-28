import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.businessId) {
      return NextResponse.json({ error: "No business selected" }, { status: 400 });
    }

    const businessId = session.user.businessId;

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get this month's date range
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Fetch all stats in parallel
    const [
      todayOrders,
      monthlyOrders,
      customerCount,
      productCount,
      recentOrders,
    ] = await Promise.all([
      // Today's orders
      prisma.order.aggregate({
        where: {
          businessId,
          orderDate: {
            gte: today,
            lt: tomorrow,
          },
          status: "COMPLETED",
        },
        _sum: {
          totalAmount: true,
        },
        _count: true,
      }),

      // Monthly orders
      prisma.order.aggregate({
        where: {
          businessId,
          orderDate: {
            gte: firstDayOfMonth,
            lt: firstDayOfNextMonth,
          },
          status: "COMPLETED",
        },
        _sum: {
          totalAmount: true,
        },
        _count: true,
      }),

      // Customer count
      prisma.customer.count({
        where: { businessId, isActive: true },
      }),

      // Product count
      prisma.product.count({
        where: { businessId, isActive: true },
      }),

      // Recent orders
      prisma.order.findMany({
        where: { businessId },
        take: 5,
        orderBy: { orderDate: "desc" },
        include: {
          customer: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      todaySales: todayOrders._sum.totalAmount || 0,
      todayOrderCount: todayOrders._count,
      monthlySales: monthlyOrders._sum.totalAmount || 0,
      monthlyOrderCount: monthlyOrders._count,
      customerCount,
      productCount,
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
