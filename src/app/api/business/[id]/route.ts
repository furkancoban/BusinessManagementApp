import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
          businessId: params.id,
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

    // Delete the business (cascade will handle related data)
    await prisma.business.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "İşletme silindi" });
  } catch (error: any) {
    console.error("Delete business error:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "İşletme bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

