import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendVerificationEmail, generateToken } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "E-posta adresi gereklidir" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({
        message: "Eğer bu e-posta kayıtlıysa, doğrulama e-postası gönderildi.",
      });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Bu e-posta zaten doğrulanmış" },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verifyToken = generateToken();
    const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifyToken,
        verifyTokenExp,
      },
    });

    // Send verification email
    await sendVerificationEmail(user.email, verifyToken, user.name);

    return NextResponse.json({
      message: "Doğrulama e-postası gönderildi.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "E-posta gönderilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

