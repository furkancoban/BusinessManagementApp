import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || "admin@example.com";

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        businesses: {
          include: { business: true },
        },
      },
    });

    if (!user) {
      console.log(`❌ Kullanıcı bulunamadı: ${email}`);
      return;
    }

    console.log("\n👤 Kullanıcı Bilgileri:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   İsim: ${user.name}`);
    console.log(`   Aktif: ${user.isActive}`);
    console.log(`   Email Doğrulandı: ${user.emailVerified}`);
    console.log(`   İşletmeler: ${user.businesses.length}`);
    
    if (user.businesses.length > 0) {
      console.log("\n🏢 İşletmeler:");
      user.businesses.forEach((ub) => {
        console.log(`   - ${ub.business.name} (${ub.role}) - Default: ${ub.isDefault}`);
      });
    } else {
      console.log("\n⚠️  Kullanıcının bağlı işletmesi yok!");
    }

  } catch (error: any) {
    console.error("❌ Hata:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

