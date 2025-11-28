import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { sendVerificationEmail, generateToken } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Generate verification token
    const verifyToken = generateToken();
    const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with verification token
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        emailVerified: false,
        verifyToken,
        verifyTokenExp,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(
      user.email,
      verifyToken,
      user.name
    );

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      // Don't fail registration if email fails, but log it
    }

    return NextResponse.json(
      { 
        message: "Kullanıcı başarıyla oluşturuldu. Lütfen e-postanızı doğrulayın.", 
        user,
        emailSent: emailResult.success,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Geçersiz veri" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}
