import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const order = await prisma.order.findFirst({
      where: { id: params.id, businessId: session.user.businessId },
      include: { customer: true, items: { include: { product: true } }, createdBy: { select: { name: true } } },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const business = await prisma.business.findUnique({ where: { id: session.user.businessId } });

    return NextResponse.json({ order, businessInfo: business });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const order = await prisma.order.findFirst({
      where: { id: params.id, businessId: session.user.businessId },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const body = await request.json();
    const { paymentType } = body;

    if (!paymentType) return NextResponse.json({ error: "Payment type is required" }, { status: 400 });

    const validPaymentTypes = ["CASH", "CARD", "TRANSFER", "VERESIYE", "OTHER"];
    if (!validPaymentTypes.includes(paymentType)) {
      return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { paymentType },
      include: { customer: true, items: { include: { product: true } } },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.order.findFirst({ where: { id: params.id, businessId: session.user.businessId } });
    if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    await prisma.order.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

