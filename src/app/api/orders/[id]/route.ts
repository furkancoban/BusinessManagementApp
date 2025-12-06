import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.businessId) {
      return NextResponse.json({ error: "No business selected" }, { status: 400 });
    }

    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.id;

    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        businessId: session.user.businessId,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get business info for receipt
    const business = await prisma.business.findUnique({
      where: { id: session.user.businessId },
    });

    // Calculate previous debt: All veresiye orders before this order (excluding this order)
    // Veresiye = paymentType: "VERESIYE" and status: "COMPLETED"
    const previousDebt = await prisma.order.aggregate({
      where: {
        businessId: session.user.businessId,
        customerId: order.customerId,
        paymentType: "VERESIYE",
        status: "COMPLETED",
        id: {
          not: orderId, // Exclude this order
        },
        orderDate: {
          lt: order.orderDate,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Calculate total debt after this order
    // If this order is VERESIYE and COMPLETED, include it in the total
    const previousDebtAmount = previousDebt._sum.totalAmount || 0;
    const isThisOrderVeresiye = order.paymentType === "VERESIYE" && order.status === "COMPLETED";
    const totalDebtAfter = previousDebtAmount + (isThisOrderVeresiye ? order.totalAmount : 0);

    return NextResponse.json({ 
      order, 
      businessInfo: business,
      debtInfo: {
        previousDebt: previousDebtAmount,
        totalDebtAfter: totalDebtAfter,
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.businessId) {
      return NextResponse.json({ error: "No business selected" }, { status: 400 });
    }

    // Verify order belongs to business
    const existing = await prisma.order.findFirst({
      where: { id: params.id, businessId: session.user.businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status, notes, paymentType } = body;

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        notes,
        paymentType,
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

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Update order error:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.businessId) {
      return NextResponse.json({ error: "No business selected" }, { status: 400 });
    }

    // Verify order belongs to business
    const existing = await prisma.order.findFirst({
      where: { id: params.id, businessId: session.user.businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await prisma.order.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
