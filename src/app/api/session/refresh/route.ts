import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the latest business info from database
    const business = await prisma.business.findUnique({
      where: { id: session.user.businessId },
      select: { id: true, name: true, slug: true },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    return NextResponse.json({
      businessId: business.id,
      businessName: business.name,
      businessSlug: business.slug,
    });
  } catch (error) {
    console.error("Session refresh error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

