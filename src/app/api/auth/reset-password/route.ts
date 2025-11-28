import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ valid: false }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { resetToken: token } });
  if (!user || (user.resetTokenExp && user.resetTokenExp < new Date())) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
  return NextResponse.json({ valid: true });
}

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) return NextResponse.json({ error: "Eksik veri" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { resetToken: token } });
    if (!user) return NextResponse.json({ error: "Geçersiz kod" }, { status: 400 });
    if (user.resetTokenExp && user.resetTokenExp < new Date()) return NextResponse.json({ error: "Kodun süresi dolmuş" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword, resetToken: null, resetTokenExp: null } });

    return NextResponse.json({ message: "Şifre değiştirildi." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

