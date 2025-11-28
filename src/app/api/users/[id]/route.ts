import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN" || !session.user.businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { role } = body;

    if (params.id === session.user.id && role !== "ADMIN") return NextResponse.json({ error: "Kendi admin yetkinizi kaldıramazsınız" }, { status: 400 });

    const userBusiness = await prisma.userBusiness.update({
      where: { userId_businessId: { userId: params.id, businessId: session.user.businessId } },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ user: { id: userBusiness.user.id, name: userBusiness.user.name, email: userBusiness.user.email, role: userBusiness.role } });
  } catch (error: any) {
    console.error("Update user error:", error);
    if (error.code === "P2025") return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN" || !session.user.businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (params.id === session.user.id) return NextResponse.json({ error: "Kendi hesabınızı silemezsiniz" }, { status: 400 });

    await prisma.userBusiness.delete({ where: { userId_businessId: { userId: params.id, businessId: session.user.businessId } } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete user error:", error);
    if (error.code === "P2025") return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

