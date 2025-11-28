/**
 * Script to create an admin user for an existing business
 * 
 * NOTE: Admin roles are now per-business. This script adds an admin to an existing business.
 * To create a new business with admin, use: scripts/create-business.ts
 * 
 * Usage:
 *   npx tsx scripts/create-admin.ts <business_slug> <email> <password> <name>
 * 
 * Example:
 *   npx tsx scripts/create-admin.ts ornek-ticaret admin@yeniisletme.com sifre123 "Yeni Yönetici"
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 4) {
    console.log("\n📋 Admin Kullanıcı Oluşturma Scripti\n");
    console.log("Kullanım:");
    console.log("  npx tsx scripts/create-admin.ts <business_slug> <email> <password> <name>\n");
    console.log("Örnek:");
    console.log('  npx tsx scripts/create-admin.ts ornek-ticaret admin@yeni.com sifre123 "Yeni Admin"\n');
    
    // List available businesses
    const businesses = await prisma.business.findMany({
      select: { slug: true, name: true },
    });
    
    if (businesses.length > 0) {
      console.log("Mevcut İşletmeler:");
      businesses.forEach((b) => {
        console.log(`  - ${b.slug} (${b.name})`);
      });
      console.log("");
    }
    
    console.log("💡 Yeni bir işletme oluşturmak için:");
    console.log('   npx tsx scripts/create-business.ts "İşletme Adı" email@ornek.com sifre123 "Admin Adı"\n');
    process.exit(1);
  }

  const [businessSlug, email, password, name] = args;

  // Find business
  const business = await prisma.business.findUnique({
    where: { slug: businessSlug },
  });

  if (!business) {
    console.log(`\n❌ İşletme bulunamadı: ${businessSlug}`);
    console.log("   Mevcut işletmeleri görmek için scripti parametresiz çalıştırın.\n");
    process.exit(1);
  }

  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    console.log(`\n⚠️  Bu e-posta zaten kayıtlı: ${email}`);
    
    // Check if already linked to this business
    const existingLink = await prisma.userBusiness.findUnique({
      where: {
        userId_businessId: {
          userId: user.id,
          businessId: business.id,
        },
      },
    });

    if (existingLink) {
      if (existingLink.role === "ADMIN") {
        console.log(`   Zaten bu işletmede admin.\n`);
        process.exit(0);
      } else {
        // Update to admin
        await prisma.userBusiness.update({
          where: {
            userId_businessId: {
              userId: user.id,
              businessId: business.id,
            },
          },
          data: { role: "ADMIN" },
        });
        console.log(`   ✅ Kullanıcı ADMIN olarak güncellendi!\n`);
        process.exit(0);
      }
    }
  } else {
    // Create new user
    const hashedPassword = await bcrypt.hash(password, 12);
    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    console.log(`\n✅ Kullanıcı oluşturuldu: ${user.email}`);
  }

  // Link user to business as admin
  await prisma.userBusiness.create({
    data: {
      userId: user.id,
      businessId: business.id,
      role: "ADMIN",
      isDefault: true,
    },
  });

  console.log(`✅ Kullanıcı işletmeye admin olarak eklendi!`);
  console.log(`\n📋 Giriş Bilgileri:`);
  console.log(`   📧 E-posta: ${user.email}`);
  console.log(`   👤 İsim: ${user.name}`);
  console.log(`   🏢 İşletme: ${business.name}`);
  console.log(`   🔑 Rol: ADMIN`);
  console.log(`\n   Şimdi giriş yapabilirsiniz: http://localhost:3000/login\n`);
}

main()
  .catch((e) => {
    console.error("Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
