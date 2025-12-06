import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

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
    
    // Last month for comparison
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    // Last 7 days for chart
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 6);

    // Fetch all stats in parallel
    const [
      todayOrders,
      monthlyOrders,
      lastMonthOrders,
      customerCount,
      productCount,
      recentOrders,
      allOrders,
      topProducts,
      topCustomers,
      lowStockProducts,
      recentCustomers,
      unpaidVeresiyeOrders,
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

      // Last month orders for comparison
      prisma.order.aggregate({
        where: {
          businessId,
          orderDate: {
            gte: firstDayOfLastMonth,
            lt: firstDayOfMonth,
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

      // All orders for last 7 days (for chart)
      prisma.order.findMany({
        where: {
          businessId,
          orderDate: {
            gte: last7Days,
          },
          status: "COMPLETED",
        },
        select: {
          orderDate: true,
          totalAmount: true,
        },
        orderBy: { orderDate: "asc" },
      }),

      // Top products by sales
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: {
            businessId,
            status: "COMPLETED",
            orderDate: {
              gte: firstDayOfMonth,
            },
          },
        },
        _sum: {
          quantity: true,
          subtotal: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 5,
      }),

      // Top customers by order value
      prisma.order.groupBy({
        by: ["customerId"],
        where: {
          businessId,
          status: "COMPLETED",
          orderDate: {
            gte: firstDayOfMonth,
          },
        },
        _sum: {
          totalAmount: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            totalAmount: "desc",
          },
        },
        take: 5,
      }),

      // Low stock products
      prisma.product.findMany({
        where: {
          businessId,
          isActive: true,
          stockQuantity: {
            lte: 10,
          },
        },
        select: {
          id: true,
          name: true,
          stockQuantity: true,
          sellPrice: true,
        },
        orderBy: {
          stockQuantity: "asc",
        },
        take: 5,
      }),

      // Recent customers
      prisma.customer.findMany({
        where: { businessId, isActive: true },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      }),

      // Unpaid orders (VERESIYE)
      prisma.order.aggregate({
        where: {
          businessId,
          paymentType: "VERESIYE",
          status: "COMPLETED",
        },
        _sum: {
          totalAmount: true,
        },
        _count: true,
      }),
    ]);

    // Get product details for top products
    const topProductIds = topProducts.map((p: any) => p.productId);
    const topProductDetails = await prisma.product.findMany({
      where: {
        id: { in: topProductIds },
      },
      select: {
        id: true,
        name: true,
        sellPrice: true,
      },
    });

    // Get customer details for top customers
    const topCustomerIds = topCustomers.map((c: any) => c.customerId);
    const topCustomerDetails = await prisma.customer.findMany({
      where: {
        id: { in: topCustomerIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Calculate sales chart data (last 7 days)
    const salesChartData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(last7Days);
      date.setDate(date.getDate() + i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const daySales = allOrders
        .filter((o: any) => {
          const orderDate = new Date(o.orderDate);
          return orderDate >= dayStart && orderDate <= dayEnd;
        })
        .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

      return {
        date: date.toISOString().split("T")[0],
        sales: daySales,
      };
    });

    // Calculate profit (revenue - cost)
    // Exclude VERESIYE (unpaid) orders from profit calculation
    const monthlyOrderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          businessId,
          status: "COMPLETED",
          paymentType: {
            not: "VERESIYE", // Exclude unpaid veresiye orders
          },
          orderDate: {
            gte: firstDayOfMonth,
            lt: firstDayOfNextMonth,
          },
        },
      },
      select: {
        subtotal: true,
        purchasePrice: true,
        quantity: true,
      },
    });

    const revenue = monthlyOrderItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const cost = monthlyOrderItems.reduce((sum, item) => sum + ((item.purchasePrice || 0) * item.quantity), 0);
    const profit = revenue - cost;

    // Calculate average order value
    const avgOrderValue = monthlyOrders._count > 0 
      ? (monthlyOrders._sum.totalAmount || 0) / monthlyOrders._count 
      : 0;

    // Calculate growth percentages
    const monthlyGrowth = lastMonthOrders._sum.totalAmount 
      ? ((monthlyOrders._sum.totalAmount || 0) - (lastMonthOrders._sum.totalAmount || 0)) / (lastMonthOrders._sum.totalAmount || 1) * 100
      : 0;

    return NextResponse.json({
      todaySales: todayOrders._sum.totalAmount || 0,
      todayOrderCount: todayOrders._count,
      monthlySales: monthlyOrders._sum.totalAmount || 0,
      monthlyOrderCount: monthlyOrders._count,
      lastMonthSales: lastMonthOrders._sum.totalAmount || 0,
      monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
      customerCount,
      productCount,
      recentOrders,
      salesChartData,
      topProducts: topProducts.map((p: any) => {
        const product = topProductDetails.find((pd: any) => pd.id === p.productId);
        return {
          id: p.productId,
          name: product?.name || "Bilinmeyen Ürün",
          quantity: p._sum.quantity || 0,
          revenue: p._sum.subtotal || 0,
        };
      }),
      topCustomers: topCustomers.map((c: any) => {
        const customer = topCustomerDetails.find((cd: any) => cd.id === c.customerId);
        return {
          id: c.customerId,
          name: customer?.name || "Bilinmeyen Müşteri",
          totalSpent: c._sum.totalAmount || 0,
          orderCount: c._count.id || 0,
        };
      }),
      lowStockProducts,
      recentCustomers,
      unpaidAmount: unpaidVeresiyeOrders._sum.totalAmount || 0,
      unpaidOrderCount: unpaidVeresiyeOrders._count || 0,
      profit: Math.round(profit),
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
