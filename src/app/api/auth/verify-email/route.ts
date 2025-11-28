import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Doğrulama kodu gereklidir" },
        { status: 400 }
      );
    }

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { verifyToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş doğrulama kodu" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (user.verifyTokenExp && user.verifyTokenExp < new Date()) {
      return NextResponse.json(
        { error: "Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod talep edin." },
        { status: 400 }
      );
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verifyToken: null,
        verifyTokenExp: null,
      },
    });

    return NextResponse.json({
      message: "E-posta başarıyla doğrulandı. Şimdi giriş yapabilirsiniz.",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Doğrulama sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

