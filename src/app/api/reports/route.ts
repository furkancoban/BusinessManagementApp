import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const businessId = session.user.businessId;
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) { const end = new Date(endDate); end.setHours(23, 59, 59, 999); dateFilter.lte = end; }

    const where = { businessId, status: "COMPLETED", ...(startDate || endDate ? { orderDate: dateFilter } : {}) };
    const veresiyeWhere = { businessId, paymentType: "VERESIYE", ...(startDate || endDate ? { orderDate: dateFilter } : {}) };

    const orders = await prisma.order.findMany({ where, include: { customer: { select: { id: true, name: true } }, items: { include: { product: { select: { id: true, name: true } } } } } });
    const veresiyeOrders = await prisma.order.findMany({ where: veresiyeWhere, include: { customer: { select: { id: true, name: true } }, items: { include: { product: { select: { id: true, name: true } } } } } });

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalProfit = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + (item.unitPrice - item.purchasePrice) * item.quantity, 0), 0);
    const orderCount = orders.length;
    const averageOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    const productStats = new Map<string, { productId: string; productName: string; totalQuantity: number; totalRevenue: number }>();
    const customerStats = new Map<string, { customerId: string; customerName: string; orderCount: number; totalSpent: number }>();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productStats.get(item.productId);
        if (existing) { existing.totalQuantity += item.quantity; existing.totalRevenue += item.subtotal; }
        else { productStats.set(item.productId, { productId: item.productId, productName: item.product.name, totalQuantity: item.quantity, totalRevenue: item.subtotal }); }
      });

      const existing = customerStats.get(order.customerId);
      if (existing) { existing.orderCount += 1; existing.totalSpent += order.totalAmount; }
      else { customerStats.set(order.customerId, { customerId: order.customerId, customerName: order.customer.name, orderCount: 1, totalSpent: order.totalAmount }); }
    });

    const topProducts = Array.from(productStats.values()).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);
    const topCustomers = Array.from(customerStats.values()).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

    const stockReport = await prisma.product.findMany({ where: { businessId, isActive: true }, select: { id: true, name: true, sku: true, category: true, stockQuantity: true, purchasePrice: true, sellPrice: true }, orderBy: { stockQuantity: "asc" } });
    const totalStockValue = stockReport.reduce((sum, product) => sum + product.stockQuantity * product.purchasePrice, 0);
    const lowStockCount = stockReport.filter((p) => p.stockQuantity < 10).length;
    const outOfStockCount = stockReport.filter((p) => p.stockQuantity === 0).length;

    // Veresiye order statistics
    const veresiyeTotalAmount = veresiyeOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const veresiyeOrderCount = veresiyeOrders.length;
    const veresiyeCustomerStats = new Map<string, { customerId: string; customerName: string; orderCount: number; totalAmount: number; orders: any[] }>();
    
    veresiyeOrders.forEach((order) => {
      const existing = veresiyeCustomerStats.get(order.customerId);
      if (existing) {
        existing.orderCount += 1;
        existing.totalAmount += order.totalAmount;
        existing.orders.push(order);
      } else {
        veresiyeCustomerStats.set(order.customerId, {
          customerId: order.customerId,
          customerName: order.customer.name,
          orderCount: 1,
          totalAmount: order.totalAmount,
          orders: [order],
        });
      }
    });

    const veresiyeByCustomer = Array.from(veresiyeCustomerStats.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .map((customer) => ({
        customerId: customer.customerId,
        customerName: customer.customerName,
        orderCount: customer.orderCount,
        totalAmount: customer.totalAmount,
        oldestOrderDate: customer.orders.sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime())[0]?.orderDate,
      }));

    return NextResponse.json({
      totalSales,
      totalProfit,
      orderCount,
      averageOrderValue,
      topProducts,
      topCustomers,
      stockReport,
      totalStockValue,
      lowStockCount,
      outOfStockCount,
      veresiyeTotalAmount,
      veresiyeOrderCount,
      veresiyeByCustomer,
    });
  } catch (error) {
    console.error("Reports error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

