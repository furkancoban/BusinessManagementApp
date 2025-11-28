import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL = process.env.SMTP_FROM || "noreply@isletme.com";
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">İşletme Yönetim Sistemi</h1>
      <h2>Merhaba ${name}!</h2>
      <p>E-posta adresinizi doğrulamak için aşağıdaki butona tıklayın.</p>
      <a href="${verifyUrl}" style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 20px 0;">E-postamı Doğrula</a>
      <p style="color: #64748b;">Bu link 24 saat içinde geçerliliğini yitirecektir.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "E-posta Adresinizi Doğrulayın - İşletme Yönetim Sistemi",
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">İşletme Yönetim Sistemi</h1>
      <h2>Merhaba ${name}!</h2>
      <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın.</p>
      <a href="${resetUrl}" style="background: #dc2626; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 20px 0;">Şifremi Sıfırla</a>
      <p style="color: #64748b;">Bu link 1 saat içinde geçerliliğini yitirecektir.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Şifre Sıfırlama - İşletme Yönetim Sistemi",
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

export function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

