import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = await request.json();

    // Verify user has access to this business
    const userBusiness = await prisma.userBusiness.findUnique({
      where: {
        userId_businessId: {
          userId: session.user.id,
          businessId,
        },
      },
      include: {
        business: true,
      },
    });

    if (!userBusiness) {
      return NextResponse.json(
        { error: "Bu işletmeye erişiminiz yok" },
        { status: 403 }
      );
    }

    // Update default business
    await prisma.userBusiness.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });

    await prisma.userBusiness.update({
      where: {
        userId_businessId: {
          userId: session.user.id,
          businessId,
        },
      },
      data: { isDefault: true },
    });

    return NextResponse.json({
      businessId: userBusiness.businessId,
      businessName: userBusiness.business.name,
      businessSlug: userBusiness.business.slug,
      role: userBusiness.role,
    });
  } catch (error) {
    console.error("Switch business error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

