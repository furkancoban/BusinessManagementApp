import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { customerSchema } from "@/lib/validations";

export async function GET(
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

    const customer = await prisma.customer.findFirst({
      where: { 
        id: params.id,
        businessId: session.user.businessId,
      },
      include: {
        orders: {
          orderBy: { orderDate: "desc" },
          include: {
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
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Calculate customer stats
    const stats = await prisma.order.aggregate({
      where: {
        customerId: params.id,
        businessId: session.user.businessId,
        status: "COMPLETED",
      },
      _sum: {
        totalAmount: true,
      },
      _count: true,
    });

    return NextResponse.json({
      ...customer,
      stats: {
        totalOrders: stats._count,
        totalSpent: stats._sum.totalAmount || 0,
        averageOrder: stats._count > 0 ? (stats._sum.totalAmount || 0) / stats._count : 0,
      },
    });
  } catch (error) {
    console.error("Get customer error:", error);
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

    // Verify customer belongs to business
    const existing = await prisma.customer.findFirst({
      where: { id: params.id, businessId: session.user.businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = customerSchema.parse(body);

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        email: validatedData.email || null,
      },
    });

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error("Update customer error:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
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

    // Verify customer belongs to business
    const existing = await prisma.customer.findFirst({
      where: { id: params.id, businessId: session.user.businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Soft delete
    await prisma.customer.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete customer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
