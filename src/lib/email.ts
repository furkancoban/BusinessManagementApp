import nodemailer from "nodemailer";

// Create transporter - uses environment variables for configuration
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
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e40af; margin: 0;">İşletme Yönetim Sistemi</h1>
      </div>
      
      <div style="background: #f8fafc; border-radius: 12px; padding: 30px;">
        <h2 style="color: #1e293b; margin-top: 0;">Merhaba ${name}!</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Hesabınızı oluşturduğunuz için teşekkürler. E-posta adresinizi doğrulamak için 
          aşağıdaki butona tıklayın.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" 
             style="background: linear-gradient(to right, #2563eb, #4f46e5); 
                    color: white; 
                    padding: 14px 32px; 
                    border-radius: 8px; 
                    text-decoration: none; 
                    font-weight: bold;
                    font-size: 16px;
                    display: inline-block;">
            E-postamı Doğrula
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          Bu link 24 saat içinde geçerliliğini yitirecektir.
        </p>
        
        <p style="color: #64748b; font-size: 14px;">
          Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px;">
        <p>Bu e-posta otomatik olarak gönderilmiştir, lütfen yanıtlamayın.</p>
      </div>
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
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e40af; margin: 0;">İşletme Yönetim Sistemi</h1>
      </div>
      
      <div style="background: #f8fafc; border-radius: 12px; padding: 30px;">
        <h2 style="color: #1e293b; margin-top: 0;">Merhaba ${name}!</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Şifrenizi sıfırlamak için bir talep aldık. Şifrenizi sıfırlamak için 
          aşağıdaki butona tıklayın.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: linear-gradient(to right, #dc2626, #ea580c); 
                    color: white; 
                    padding: 14px 32px; 
                    border-radius: 8px; 
                    text-decoration: none; 
                    font-weight: bold;
                    font-size: 16px;
                    display: inline-block;">
            Şifremi Sıfırla
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          Bu link 1 saat içinde geçerliliğini yitirecektir.
        </p>
        
        <p style="color: #64748b; font-size: 14px;">
          Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz. 
          Şifreniz değiştirilmeyecektir.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px;">
        <p>Bu e-posta otomatik olarak gönderilmiştir, lütfen yanıtlamayın.</p>
      </div>
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

// Generate a random token
export function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

