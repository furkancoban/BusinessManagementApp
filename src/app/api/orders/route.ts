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

    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId") || "";
    const status = searchParams.get("status") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {
      businessId: session.user.businessId,
    };

    if (customerId) {
      where.customerId = customerId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) {
        where.orderDate.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.orderDate.lte = end;
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { orderDate: "desc" },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.businessId) {
      return NextResponse.json({ error: "No business selected" }, { status: 400 });
    }

    const businessId = session.user.businessId;

    const body = await request.json();
    const { customerId, paymentType, notes, items } = body;

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Müşteri ve en az bir ürün gereklidir" },
        { status: 400 }
      );
    }

    // Generate order number
    const year = new Date().getFullYear();
    const lastOrder = await prisma.order.findFirst({
      where: {
        businessId: businessId,
        orderNumber: {
          startsWith: `SIP-${year}-`,
        },
      },
      orderBy: { orderNumber: "desc" },
    });

    let nextNumber = 1;
    if (lastOrder) {
      const lastNumber = parseInt(lastOrder.orderNumber.split("-")[2]);
      nextNumber = lastNumber + 1;
    }
    const orderNumber = `SIP-${year}-${nextNumber.toString().padStart(4, "0")}`;

    // Get product details for purchase prices and stock check
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { 
        id: { in: productIds },
        businessId: businessId,
      },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Check stock availability and calculate totals
    const orderItems = items.map((item: any) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Ürün bulunamadı: ${item.productId}`);
      }
      
      // Check stock availability
      if (product.stockQuantity < item.quantity) {
        throw new Error(
          `${product.name} ürününden stokta sadece ${product.stockQuantity} adet bulunmaktadır. Sipariş edilen miktar: ${item.quantity}`
        );
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        purchasePrice: product.purchasePrice,
        subtotal: item.quantity * item.unitPrice,
        product: product, // Store product for stock update
      };
    });

    const totalAmount = orderItems.reduce(
      (sum: number, item: any) => sum + item.subtotal,
      0
    );

    // Use transaction to ensure atomicity
    const order = await prisma.$transaction(async (tx) => {
      // Create order with items
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          businessId: businessId,
          customerId,
          totalAmount,
          paymentType: paymentType || "CASH",
          status: "COMPLETED",
          notes: notes || null,
          createdById: session.user.id,
          items: {
            create: orderItems.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              purchasePrice: item.purchasePrice,
              subtotal: item.subtotal,
            })),
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update stock quantities
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
