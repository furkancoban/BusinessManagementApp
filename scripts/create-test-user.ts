import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.log("\n👤 Test Kullanıcı Oluşturma Scripti\n");
    console.log("Kullanım:");
    console.log("  tsx scripts/create-test-user.ts <işletme_adı> <email> <şifre> <isim>\n");
    console.log("Örnek:");
    console.log('  tsx scripts/create-test-user.ts "Test İşletme" test@example.com test123 "Test User"\n');
    process.exit(1);
  }

  const [businessName, email, password, name] = args;

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`⚠️  Kullanıcı zaten var: ${email}`);
      console.log("   Mevcut kullanıcıyı güncelliyorum...");
      
      // Update user
      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          emailVerified: true,
          isActive: true,
        },
      });
      console.log("✅ Kullanıcı güncellendi");
    } else {
      // Create user
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          emailVerified: true,
          isActive: true,
        },
      });
      console.log(`✅ Kullanıcı oluşturuldu: ${user.email}`);
    }

    // Get or create business
    let slug = generateSlug(businessName);
    let business = await prisma.business.findUnique({ where: { slug } });
    
    if (!business) {
      business = await prisma.business.create({
        data: {
          name: businessName,
          slug,
        },
      });
      console.log(`✅ İşletme oluşturuldu: ${business.name}`);
    } else {
      console.log(`✅ İşletme bulundu: ${business.name}`);
    }

    // Link user to business
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    const existingLink = await prisma.userBusiness.findUnique({
      where: {
        userId_businessId: {
          userId: user.id,
          businessId: business.id,
        },
      },
    });

    if (!existingLink) {
      await prisma.userBusiness.create({
        data: {
          userId: user.id,
          businessId: business.id,
          role: "ADMIN",
          isDefault: true,
        },
      });
      console.log("✅ Kullanıcı işletmeye bağlandı (ADMIN)");
    } else {
      console.log("✅ Kullanıcı zaten işletmeye bağlı");
    }

    console.log("\n🎉 Test kullanıcı hazır!\n");
    console.log("📋 Giriş bilgileri:");
    console.log(`   E-posta: ${email}`);
    console.log(`   Şifre: ${password}\n`);

  } catch (error: any) {
    console.error("❌ Hata:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

