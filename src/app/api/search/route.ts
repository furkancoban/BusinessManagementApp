import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
    const query = searchParams.get("q")?.trim() || "";

    if (query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    interface SearchResult {
      type: "product" | "customer" | "order";
      id: string;
      title: string;
      subtitle?: string;
      href: string;
    }

    const results: SearchResult[] = [];

    // Search products
    const products = await prisma.product.findMany({
      where: {
        businessId,
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: {
        id: true,
        name: true,
        sku: true,
        sellPrice: true,
      },
    });

    products.forEach((product) => {
      results.push({
        type: "product",
        id: product.id,
        title: product.name,
        subtitle: product.sku ? `SKU: ${product.sku}` : undefined,
        href: `/products/${product.id}/edit`,
      });
    });

    // Search customers
    const customers = await prisma.customer.findMany({
      where: {
        businessId,
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    customers.forEach((customer) => {
      results.push({
        type: "customer",
        id: customer.id,
        title: customer.name,
        subtitle: customer.phone || customer.email || undefined,
        href: `/customers/${customer.id}`,
      });
    });

    // Search orders
    const orders = await prisma.order.findMany({
      where: {
        businessId,
        OR: [
          { orderNumber: { contains: query, mode: "insensitive" } },
          {
            customer: {
              name: { contains: query, mode: "insensitive" },
            },
          },
        ],
      },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        customer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        orderDate: "desc",
      },
    });

    orders.forEach((order) => {
      results.push({
        type: "order",
        id: order.id,
        title: order.orderNumber,
        subtitle: `${order.customer.name} - ${order.totalAmount.toFixed(2)} TL`,
        href: `/orders/${order.id}`,
      });
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

