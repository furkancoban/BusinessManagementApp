import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) return NextResponse.json({ error: "Token gereklidir" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { verifyToken: token } });
    if (!user) return NextResponse.json({ error: "Geçersiz veya süresi dolmuş kod" }, { status: 400 });
    if (user.verifyTokenExp && user.verifyTokenExp < new Date()) return NextResponse.json({ error: "Kodun süresi dolmuş" }, { status: 400 });

    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true, verifyToken: null, verifyTokenExp: null } });

    return NextResponse.json({ message: "E-posta doğrulandı. Giriş yapabilirsiniz." });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Doğrulama hatası" }, { status: 500 });
  }
}

