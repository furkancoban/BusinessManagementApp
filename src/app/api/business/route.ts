import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { seedBusinessData } from "../../../../prisma/seed";

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userBusinesses = await prisma.userBusiness.findMany({
      where: { userId: session.user.id },
      include: { business: true },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json({
      businesses: userBusinesses.map((ub) => ({ ...ub.business, role: ub.role, isDefault: ub.isDefault })),
      currentBusinessId: session.user.businessId,
    });
  } catch (error) {
    console.error("Get businesses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { name, address, phone, email, taxNumber } = body;

    if (!name) return NextResponse.json({ error: "İşletme adı gereklidir" }, { status: 400 });

    let slug = generateSlug(name);
    let slugExists = await prisma.business.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(name)}-${counter++}`;
      slugExists = await prisma.business.findUnique({ where: { slug } });
    }

    const business = await prisma.business.create({ data: { name, slug, address, phone, email, taxNumber } });

    if (session?.user?.id) {
      const existingBusinesses = await prisma.userBusiness.count({ where: { userId: session.user.id } });
      await prisma.userBusiness.create({
        data: { userId: session.user.id, businessId: business.id, role: "ADMIN", isDefault: existingBusinesses === 0 },
      });
    }

    await seedBusinessData(business.id);

    return NextResponse.json({ business, message: "İşletme oluşturuldu" }, { status: 201 });
  } catch (error: any) {
    console.error("Create business error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

