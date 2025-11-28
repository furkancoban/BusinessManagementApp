import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { sendVerificationEmail, generateToken } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return NextResponse.json({ error: "Bu e-posta adresi zaten kullanılıyor" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const verifyToken = generateToken();
    const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, password: hashedPassword, emailVerified: false, verifyToken, verifyTokenExp },
      select: { id: true, name: true, email: true },
    });

    await sendVerificationEmail(user.email, verifyToken, user.name);

    return NextResponse.json({ message: "Kullanıcı oluşturuldu. E-postanızı doğrulayın.", user }, { status: 201 });
  } catch (error: any) {
    console.error("Register error:", error);
    if (error.name === "ZodError") return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    return NextResponse.json({ error: "Kayıt sırasında bir hata oluştu" }, { status: 500 });
  }
}

