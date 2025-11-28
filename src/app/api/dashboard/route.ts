import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!session.user.businessId) return NextResponse.json({ error: "No business selected" }, { status: 400 });

    const businessId = session.user.businessId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // This month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    // Last month for comparison
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    // Last 7 days for chart
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 6);

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
      unpaidVeresiyeOrders
    ] = await Promise.all([
      // Today's orders
      prisma.order.aggregate({
        where: { businessId, orderDate: { gte: today, lt: tomorrow }, status: "COMPLETED" },
        _sum: { totalAmount: true },
        _count: true,
      }),
      // This month orders
      prisma.order.aggregate({
        where: { businessId, orderDate: { gte: firstDayOfMonth, lt: firstDayOfNextMonth }, status: "COMPLETED" },
        _sum: { totalAmount: true },
        _count: true,
      }),
      // Last month orders for comparison
      prisma.order.aggregate({
        where: { businessId, orderDate: { gte: firstDayOfLastMonth, lt: firstDayOfMonth }, status: "COMPLETED" },
        _sum: { totalAmount: true },
        _count: true,
      }),
      // Customer count
      prisma.customer.count({ where: { businessId, isActive: true } }),
      // Product count
      prisma.product.count({ where: { businessId, isActive: true } }),
      // Recent orders
      prisma.order.findMany({
        where: { businessId },
        take: 5,
        orderBy: { orderDate: "desc" },
        include: { customer: { select: { name: true } }, items: true },
      }),
      // All orders for last 7 days chart
      prisma.order.findMany({
        where: { businessId, orderDate: { gte: last7Days }, status: "COMPLETED" },
        select: { orderDate: true, totalAmount: true },
        orderBy: { orderDate: "asc" },
      }),
      // Top products
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: { order: { businessId, status: "COMPLETED" } },
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { subtotal: "desc" } },
        take: 5,
      }),
      // Top customers
      prisma.order.groupBy({
        by: ["customerId"],
        where: { businessId, status: "COMPLETED" },
        _sum: { totalAmount: true },
        _count: true,
        orderBy: { _sum: { totalAmount: "desc" } },
        take: 5,
      }),
      // Low stock products
      prisma.product.findMany({
        where: { businessId, isActive: true, stockQuantity: { lt: 10 } },
        orderBy: { stockQuantity: "asc" },
        take: 5,
        select: { id: true, name: true, stockQuantity: true, category: true },
      }),
      // Recent customers
      prisma.customer.findMany({
        where: { businessId, isActive: true },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, createdAt: true, _count: { select: { orders: true } } },
      }),
      // Unpaid Veresiye orders
      prisma.order.aggregate({
        where: { businessId, paymentType: "VERESIYE" },
        _sum: { totalAmount: true },
        _count: true,
      }),
    ]);

    // Get product names for top products
    const productIds = topProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p.name]));

    // Get customer names for top customers
    const customerIds = topCustomers.map((c) => c.customerId);
    const customers = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, name: true },
    });
    const customerMap = new Map(customers.map((c) => [c.id, c.name]));

    // Process daily sales for chart
    const dailySalesMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const date = new Date(last7Days);
      date.setDate(date.getDate() + i);
      const key = date.toISOString().split("T")[0];
      dailySalesMap.set(key, 0);
    }
    allOrders.forEach((order) => {
      const key = new Date(order.orderDate).toISOString().split("T")[0];
      dailySalesMap.set(key, (dailySalesMap.get(key) || 0) + order.totalAmount);
    });

    const dailySales = Array.from(dailySalesMap.entries()).map(([date, amount]) => {
      const d = new Date(date);
      return {
        date,
        day: d.toLocaleDateString("tr-TR", { weekday: "short" }),
        amount,
      };
    });

    // Calculate trends
    const currentMonthSales = monthlyOrders._sum.totalAmount || 0;
    const lastMonthSales = lastMonthOrders._sum.totalAmount || 0;
    const salesTrend = lastMonthSales > 0 ? ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100 : 0;

    // Calculate profit from order items
    const profitOrders = await prisma.order.findMany({
      where: { businessId, orderDate: { gte: firstDayOfMonth, lt: firstDayOfNextMonth }, status: "COMPLETED" },
      include: { items: true },
    });
    const monthlyProfit = profitOrders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + (item.unitPrice - item.purchasePrice) * item.quantity, 0),
      0
    );

    return NextResponse.json({
      todaySales: todayOrders._sum.totalAmount || 0,
      todayOrderCount: todayOrders._count,
      monthlySales: currentMonthSales,
      monthlyOrderCount: monthlyOrders._count,
      monthlyProfit,
      salesTrend: Math.round(salesTrend),
      customerCount,
      productCount,
      recentOrders,
      dailySales,
      topProducts: topProducts.map((p) => ({
        name: productMap.get(p.productId) || "Bilinmeyen",
        quantity: p._sum.quantity || 0,
        revenue: p._sum.subtotal || 0,
      })),
      topCustomers: topCustomers.map((c) => ({
        name: customerMap.get(c.customerId) || "Bilinmeyen",
        orders: c._count,
        spent: c._sum.totalAmount || 0,
      })),
      lowStockProducts,
      recentCustomers,
      unpaidVeresiyeAmount: unpaidVeresiyeOrders._sum.totalAmount || 0,
      unpaidVeresiyeCount: unpaidVeresiyeOrders._count || 0,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
