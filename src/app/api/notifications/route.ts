import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = session.user.businessId;

    // Get low stock products (stock <= 5)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        businessId,
        isActive: true,
        stockQuantity: {
          lte: 5,
        },
      },
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        sku: true,
      },
      orderBy: {
        stockQuantity: "asc",
      },
      take: 10,
    });

    // Get today's orders count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrdersCount = await prisma.order.count({
      where: {
        businessId,
        orderDate: {
          gte: today,
        },
      },
    });

    // Get out of stock products
    const outOfStockProducts = await prisma.product.findMany({
      where: {
        businessId,
        isActive: true,
        stockQuantity: 0,
      },
      select: {
        id: true,
        name: true,
        sku: true,
      },
      take: 10,
    });

    // Calculate total notifications count
    const totalCount = lowStockProducts.length + (todayOrdersCount > 0 ? 1 : 0) + outOfStockProducts.length;

    return NextResponse.json({
      notifications: {
        lowStock: lowStockProducts.map((p) => ({
          id: p.id,
          type: "low_stock",
          title: "Düşük Stok",
          message: `${p.name} ürününde sadece ${p.stockQuantity} adet kaldı`,
          productId: p.id,
          productName: p.name,
          stockQuantity: p.stockQuantity,
        })),
        outOfStock: outOfStockProducts.map((p) => ({
          id: p.id,
          type: "out_of_stock",
          title: "Stok Tükendi",
          message: `${p.name} ürününün stoğu tükendi`,
          productId: p.id,
          productName: p.name,
        })),
        todayOrders: todayOrdersCount > 0
          ? [
              {
                id: "today_orders",
                type: "today_orders",
                title: "Bugünkü Siparişler",
                message: `Bugün ${todayOrdersCount} sipariş oluşturuldu`,
                count: todayOrdersCount,
              },
            ]
          : [],
      },
      totalCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

