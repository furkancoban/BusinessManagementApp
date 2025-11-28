import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { customerSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!session.user.businessId) return NextResponse.json({ error: "No business" }, { status: 400 });

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = { businessId: session.user.businessId, isActive: true };
    if (search) where.OR = [{ name: { contains: search } }, { phone: { contains: search } }, { email: { contains: search } }];

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({ where, skip, take: limit, orderBy: { name: "asc" }, include: { _count: { select: { orders: true } }, orders: { take: 1, orderBy: { orderDate: "desc" }, select: { orderDate: true, totalAmount: true } } } }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({ customers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Get customers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!session.user.businessId) return NextResponse.json({ error: "No business" }, { status: 400 });

    const body = await request.json();
    const data = customerSchema.parse(body);

    const customer = await prisma.customer.create({
      data: { ...data, email: data.email || null, businessId: session.user.businessId, createdById: session.user.id },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error("Create customer error:", error);
    if (error.name === "ZodError") return NextResponse.json({ error: "Validation error" }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

