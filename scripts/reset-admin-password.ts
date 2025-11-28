import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log("\n🔐 Admin Şifre Sıfırlama Scripti\n");
    console.log("Kullanım:");
    console.log("  tsx scripts/reset-admin-password.ts <email> <yeni_sifre>\n");
    console.log("Örnek:");
    console.log("  tsx scripts/reset-admin-password.ts admin@example.com yeniSifre123\n");
    process.exit(1);
  }

  const [email, newPassword] = args;

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ Hata: ${email} adresine sahip kullanıcı bulunamadı.`);
      process.exit(1);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        emailVerified: true,
        isActive: true,
      },
    });

    console.log("\n✅ Şifre başarıyla güncellendi!\n");
    console.log("📋 Giriş bilgileri:");
    console.log(`   E-posta: ${email}`);
    console.log(`   Şifre: ${newPassword}\n`);

  } catch (error: any) {
    console.error("❌ Hata:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

