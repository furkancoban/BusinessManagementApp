import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { productSchema } from "@/lib/validations";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.businessId) {
      return NextResponse.json({ error: "No business selected" }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where = {
      businessId: session.user.businessId,
      isActive: true,
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search } },
                { sku: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {},
        category ? { category } : {},
      ],
    };

    const [products, total, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.product.count({ where }),
      prisma.product.findMany({
        where: { businessId: session.user.businessId, isActive: true, category: { not: null } },
        select: { category: true },
        distinct: ["category"],
      }),
    ]);

    return NextResponse.json({
      products,
      categories: categories.map((c) => c.category).filter(Boolean),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get products error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error?.message || String(error),
        ...(process.env.NODE_ENV === "development" && { stack: error?.stack })
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.businessId) {
      return NextResponse.json({ error: "No business selected" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        sku: validatedData.sku || null,
        businessId: session.user.businessId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Create product error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu SKU zaten kullanılıyor" },
        { status: 400 }
      );
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
