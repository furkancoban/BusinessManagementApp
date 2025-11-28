import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        businesses: {
          include: { business: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        error: "User not found",
        debug: { email, userExists: false },
      }, { status: 401 });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    return NextResponse.json({
      email,
      userExists: true,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      passwordValid: isPasswordValid,
      hasBusinesses: user.businesses.length > 0,
      businesses: user.businesses.map(ub => ({
        name: ub.business.name,
        role: ub.role,
        isDefault: ub.isDefault,
      })),
      canLogin: user.isActive && user.emailVerified && isPasswordValid && user.businesses.length > 0,
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    }, { status: 500 });
  }
}

