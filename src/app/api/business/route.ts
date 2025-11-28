import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { seedBusinessData } from "../../../../prisma/seed";

// Generate URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Get user's businesses
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userBusinesses = await prisma.userBusiness.findMany({
      where: { userId: session.user.id },
      include: {
        business: true,
      },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json({
      businesses: userBusinesses.map((ub) => ({
        ...ub.business,
        role: ub.role,
        isDefault: ub.isDefault,
      })),
      currentBusinessId: session.user.businessId,
    });
  } catch (error) {
    console.error("Get businesses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create new business
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { name, address, phone, email, taxNumber, adminName, adminEmail, adminPassword } = body;

    if (!name) {
      return NextResponse.json(
        { error: "İşletme adı gereklidir" },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = generateSlug(name);
    let slugExists = await prisma.business.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(name)}-${counter}`;
      slugExists = await prisma.business.findUnique({ where: { slug } });
      counter++;
    }

    // Create business
    const business = await prisma.business.create({
      data: {
        name,
        slug,
        address,
        phone,
        email,
        taxNumber,
      },
    });

    let userId = session?.user?.id;

    // If creating with new admin (no session or explicit admin details)
    if (!session && adminEmail && adminPassword && adminName) {
      // Check if user exists
      let user = await prisma.user.findUnique({ where: { email: adminEmail } });
      
      if (!user) {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        user = await prisma.user.create({
          data: {
            email: adminEmail,
            password: hashedPassword,
            name: adminName,
          },
        });
      }
      userId = user.id;
    }

    // Link user to business as admin
    if (userId) {
      // Check if this is user's first business
      const existingBusinesses = await prisma.userBusiness.count({
        where: { userId },
      });

      await prisma.userBusiness.create({
        data: {
          userId,
          businessId: business.id,
          role: "ADMIN",
          isDefault: existingBusinesses === 0,
        },
      });
    }

    // Seed demo data
    await seedBusinessData(business.id);

    return NextResponse.json({
      business,
      message: "İşletme başarıyla oluşturuldu",
    }, { status: 201 });
  } catch (error: any) {
    console.error("Create business error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

