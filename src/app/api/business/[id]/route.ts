import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle both sync and async params (Next.js 14+)
    const resolvedParams = await Promise.resolve(params);
    const businessId = resolvedParams.id;

    if (!businessId) {
      return NextResponse.json({ error: "İşletme ID gereklidir" }, { status: 400 });
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: "Şifre gereklidir" }, { status: 400 });
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Şifre yanlış" }, { status: 400 });
    }

    // Verify the business belongs to the user
    const userBusiness = await prisma.userBusiness.findUnique({
      where: {
        userId_businessId: {
          userId: session.user.id,
          businessId: businessId,
        },
      },
    });

    if (!userBusiness || userBusiness.role !== "ADMIN") {
      return NextResponse.json({ error: "Bu işletmeyi silme yetkiniz yok" }, { status: 403 });
    }

    // Check if this is the user's only business
    const userBusinessCount = await prisma.userBusiness.count({
      where: { userId: session.user.id },
    });

    if (userBusinessCount === 1) {
      return NextResponse.json(
        { error: "Son işletmenizi silemezsiniz. Önce yeni bir işletme oluşturun." },
        { status: 400 }
      );
    }

    // Delete related data in correct order to avoid foreign key constraints
    // 1. Delete OrderItems first (they reference both Order and Product)
    await prisma.orderItem.deleteMany({
      where: {
        order: {
          businessId: businessId,
        },
      },
    });

    // 2. Delete Orders
    await prisma.order.deleteMany({
      where: {
        businessId: businessId,
      },
    });

    // 3. Delete Products (OrderItems are already deleted, so this is safe)
    await prisma.product.deleteMany({
      where: {
        businessId: businessId,
      },
    });

    // 4. Delete Customers
    await prisma.customer.deleteMany({
      where: {
        businessId: businessId,
      },
    });

    // 5. Delete UserBusiness relationships
    await prisma.userBusiness.deleteMany({
      where: {
        businessId: businessId,
      },
    });

    // 6. Finally delete the business
    await prisma.business.delete({
      where: { id: businessId },
    });

    return NextResponse.json({ success: true, message: "İşletme silindi" });
  } catch (error: any) {
    console.error("Delete business error:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "İşletme bulunamadı" }, { status: 404 });
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

