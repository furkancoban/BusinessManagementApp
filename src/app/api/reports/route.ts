import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

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
          existing.totalQuantity += Number(item.quantity) || 0;
          existing.totalRevenue += Number(item.subtotal) || 0;
        } else {
          productStats.set(item.productId, {
            productId: item.productId,
            productName: item.product.name,
            totalQuantity: Number(item.quantity) || 0,
            totalRevenue: Number(item.subtotal) || 0,
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

    // Convert Map to array
    const allProducts = Array.from(productStats.values());
    
    // Create a copy and sort by totalQuantity in DESCENDING order
    // Sort function: return negative if b should come before a (b > a means b comes first)
    const sortedProducts = [...allProducts].sort((a, b) => {
      // Convert to numbers explicitly
      const qtyA = typeof a.totalQuantity === 'number' ? a.totalQuantity : Number(a.totalQuantity) || 0;
      const qtyB = typeof b.totalQuantity === 'number' ? b.totalQuantity : Number(b.totalQuantity) || 0;
      
      // Sort by quantity descending: if b's quantity > a's quantity, b comes first (return negative)
      // This means highest quantity will be first
      if (qtyB !== qtyA) {
        return qtyB - qtyA; // Descending order
      }
      
      // If quantities are equal, sort by revenue descending
      const revA = typeof a.totalRevenue === 'number' ? a.totalRevenue : Number(a.totalRevenue) || 0;
      const revB = typeof b.totalRevenue === 'number' ? b.totalRevenue : Number(b.totalRevenue) || 0;
      return revB - revA; // Descending order
    });

    // Debug logs
    console.log('[REPORTS API] Before sort:', JSON.stringify(allProducts.map(p => ({ name: p.productName, qty: p.totalQuantity }))));
    console.log('[REPORTS API] After sort:', JSON.stringify(sortedProducts.map(p => ({ name: p.productName, qty: p.totalQuantity }))));

    // Take top 5 and add stock quantity
    const topProducts = sortedProducts
      .slice(0, 5)
      .map((product) => ({
        ...product,
        stockQuantity: productStockMap.get(product.productId) || 0,
      }));
    
    console.log('[REPORTS API] Final topProducts:', JSON.stringify(topProducts.map(p => ({ name: p.productName, qty: p.totalQuantity }))));

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
