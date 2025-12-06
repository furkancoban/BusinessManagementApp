import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.businessId) {
      return NextResponse.json({ error: "No business selected" }, { status: 400 });
    }

    const businessId = session.user.businessId;
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    const where = {
      businessId,
      status: "COMPLETED",
      ...(startDate || endDate ? { orderDate: dateFilter } : {}),
    };

    // Get all completed orders in date range
    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Calculate totals
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalProfit = orders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce(
          (itemSum, item) =>
            itemSum + (item.unitPrice - item.purchasePrice) * item.quantity,
          0
        ),
      0
    );
    const orderCount = orders.length;
    const averageOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    // Top products
    const productStats = new Map<
      string,
      { productId: string; productName: string; totalQuantity: number; totalRevenue: number }
    >();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productStats.get(item.productId);
        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.totalRevenue += item.subtotal;
        } else {
          productStats.set(item.productId, {
            productId: item.productId,
            productName: item.product.name,
            totalQuantity: item.quantity,
            totalRevenue: item.subtotal,
          });
        }
      });
    });

    // Get product details including stock for top products
    const topProductIds = Array.from(productStats.keys());
    const topProductDetails = await prisma.product.findMany({
      where: {
        id: { in: topProductIds },
        businessId,
      },
      select: {
        id: true,
        stockQuantity: true,
      },
    });

    const productStockMap = new Map(
      topProductDetails.map((p) => [p.id, p.stockQuantity])
    );

    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5)
      .map((product) => ({
        ...product,
        stockQuantity: productStockMap.get(product.productId) || 0,
      }));

    // Top customers
    const customerStats = new Map<
      string,
      { customerId: string; customerName: string; orderCount: number; totalSpent: number }
    >();

    orders.forEach((order) => {
      const existing = customerStats.get(order.customerId);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += order.totalAmount;
      } else {
        customerStats.set(order.customerId, {
          customerId: order.customerId,
          customerName: order.customer.name,
          orderCount: 1,
          totalSpent: order.totalAmount,
        });
      }
    });

    const topCustomers = Array.from(customerStats.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    // New customers in date range
    const newCustomerCount = await prisma.customer.count({
      where: {
        businessId,
        isActive: true,
        ...(startDate || endDate ? { createdAt: dateFilter } : {}),
      },
    });

    // Stock report
    const stockReport = await prisma.product.findMany({
      where: { businessId, isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        stockQuantity: true,
        purchasePrice: true,
        sellPrice: true,
      },
      orderBy: { stockQuantity: "asc" },
    });

    const totalStockValue = stockReport.reduce(
      (sum, product) => sum + product.stockQuantity * product.purchasePrice,
      0
    );
    const lowStockCount = stockReport.filter((p) => p.stockQuantity < 10).length;
    const outOfStockCount = stockReport.filter((p) => p.stockQuantity === 0).length;

    // Veresiye orders total (unpaid veresiye orders)
    const veresiyeOrders = await prisma.order.findMany({
      where: {
        businessId,
        paymentType: "VERESIYE",
        status: "COMPLETED",
        ...(startDate || endDate ? { orderDate: dateFilter } : {}),
      },
      select: {
        totalAmount: true,
      },
    });

    const totalVeresiyeAmount = veresiyeOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const veresiyeOrderCount = veresiyeOrders.length;

    return NextResponse.json({
      totalSales,
      totalProfit,
      orderCount,
      averageOrderValue,
      newCustomerCount,
      topProducts,
      topCustomers,
      stockReport,
      totalStockValue,
      lowStockCount,
      outOfStockCount,
      totalVeresiyeAmount,
      veresiyeOrderCount,
    });
  } catch (error) {
    console.error("Reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
