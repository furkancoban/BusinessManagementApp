import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token gereklidir"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { resetToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş sıfırlama kodu" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (user.resetTokenExp && user.resetTokenExp < new Date()) {
      return NextResponse.json(
        { error: "Sıfırlama kodunun süresi dolmuş. Lütfen yeni bir talep oluşturun." },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    return NextResponse.json({
      message: "Şifreniz başarıyla değiştirildi. Şimdi giriş yapabilirsiniz.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Geçersiz veri" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Şifre sıfırlama sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Verify token is valid (for page to check before showing form)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token gereklidir" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { resetToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { valid: false, error: "Geçersiz sıfırlama kodu" },
        { status: 400 }
      );
    }

    if (user.resetTokenExp && user.resetTokenExp < new Date()) {
      return NextResponse.json(
        { valid: false, error: "Sıfırlama kodunun süresi dolmuş" },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Verify reset token error:", error);
    return NextResponse.json(
      { valid: false, error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

