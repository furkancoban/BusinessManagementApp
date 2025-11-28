import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail, generateToken } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "E-posta gereklidir" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ message: "E-posta gönderildi" }); // Don't reveal if user exists

    const resetToken = generateToken();
    const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetTokenExp } });
    await sendPasswordResetEmail(user.email, resetToken, user.name);

    return NextResponse.json({ message: "Şifre sıfırlama bağlantısı gönderildi." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

