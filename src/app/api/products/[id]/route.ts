import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { productSchema } from "@/lib/validations";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const product = await prisma.product.findFirst({ where: { id: params.id, businessId: session.user.businessId } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.product.findFirst({ where: { id: params.id, businessId: session.user.businessId } });
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const body = await request.json();
    const data = productSchema.parse(body);
    const product = await prisma.product.update({ where: { id: params.id }, data: { ...data, sku: data.sku || null } });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Update product error:", error);
    if (error.code === "P2002") return NextResponse.json({ error: "Bu SKU zaten kullanılıyor" }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.product.findFirst({ where: { id: params.id, businessId: session.user.businessId } });
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    await prisma.product.update({ where: { id: params.id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

