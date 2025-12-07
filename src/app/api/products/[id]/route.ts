import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { z } from "zod";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.businessId) {
      return NextResponse.json({ error: "No business selected" }, { status: 400 });
    }

    const resolvedParams = await Promise.resolve(params);
    const productId = resolvedParams.id;

    const product = await prisma.product.findFirst({
      where: { 
        id: productId,
        businessId: session.user.businessId,
      },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.businessId) {
      return NextResponse.json({ error: "No business selected" }, { status: 400 });
    }

    // Handle both sync and async params (Next.js 14+)
    const resolvedParams = await Promise.resolve(params);
    const productId = resolvedParams.id;

    // Verify product belongs to business
    const existing = await prisma.product.findFirst({
      where: { id: productId, businessId: session.user.businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await request.json();
    
    // If only stockQuantity is provided, do a partial update
    if (Object.keys(body).length === 1 && body.stockQuantity !== undefined) {
      const stockQuantity = z.coerce.number().int().min(0).parse(body.stockQuantity);
      const product = await prisma.product.update({
        where: { id: productId },
        data: { stockQuantity },
      });
      return NextResponse.json(product);
    }

    // Full update with validation
    const validatedData = productSchema.parse(body);

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...validatedData,
        sku: validatedData.sku || null,
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Update product error:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.businessId) {
      return NextResponse.json({ error: "No business selected" }, { status: 400 });
    }

    const resolvedParams = await Promise.resolve(params);
    const productId = resolvedParams.id;

    // Verify product belongs to business
    const existing = await prisma.product.findFirst({
      where: { id: productId, businessId: session.user.businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Soft delete
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
