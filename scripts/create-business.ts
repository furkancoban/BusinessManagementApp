import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Generate URL-friendly slug
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

// Seed demo data for a business
async function seedBusinessData(businessId: string) {
  // Create demo customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        businessId,
        name: "Ahmet Yılmaz",
        phone: "0532 123 4567",
        email: "ahmet@email.com",
        address: "Kadıköy, İstanbul",
        notes: "VIP müşteri, özel indirim uygulanır",
      },
    }),
    prisma.customer.create({
      data: {
        businessId,
        name: "Fatma Kaya",
        phone: "0544 987 6543",
        email: "fatma@email.com",
        address: "Çankaya, Ankara",
      },
    }),
    prisma.customer.create({
      data: {
        businessId,
        name: "Mehmet Demir",
        phone: "0555 456 7890",
        email: "mehmet@email.com",
        address: "Konak, İzmir",
        notes: "Toptan alıcı",
      },
    }),
  ]);

  // Create demo products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        businessId,
        name: "Örnek Ürün 1",
        sku: "URN-001",
        description: "Örnek ürün açıklaması",
        category: "Genel",
        purchasePrice: 100,
        sellPrice: 150,
        stockQuantity: 50,
      },
    }),
    prisma.product.create({
      data: {
        businessId,
        name: "Örnek Ürün 2",
        sku: "URN-002",
        description: "İkinci örnek ürün",
        category: "Genel",
        purchasePrice: 200,
        sellPrice: 300,
        stockQuantity: 30,
      },
    }),
    prisma.product.create({
      data: {
        businessId,
        name: "Örnek Ürün 3",
        sku: "URN-003",
        description: "Üçüncü örnek ürün",
        category: "Aksesuar",
        purchasePrice: 50,
        sellPrice: 80,
        stockQuantity: 100,
      },
    }),
  ]);

  // Create a demo order
  await prisma.order.create({
    data: {
      businessId,
      orderNumber: "SIP-2024-0001",
      customerId: customers[0].id,
      totalAmount: 380,
      paymentType: "CASH",
      status: "COMPLETED",
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 2,
            unitPrice: 150,
            purchasePrice: 100,
            subtotal: 300,
          },
          {
            productId: products[2].id,
            quantity: 1,
            unitPrice: 80,
            purchasePrice: 50,
            subtotal: 80,
          },
        ],
      },
    },
  });

  return { customers, products };
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.log("\n📦 Yeni İşletme Oluşturma Scripti\n");
    console.log("Kullanım:");
    console.log("  tsx scripts/create-business.ts <işletme_adı> <admin_email> <admin_şifre> <admin_adı>\n");
    console.log("Örnek:");
    console.log('  tsx scripts/create-business.ts "Güneş Ticaret" admin@gunes.com sifre123 "Ali Veli"\n');
    console.log("Notlar:");
    console.log("  - Demo veriler (3 müşteri, 3 ürün, 1 sipariş) otomatik eklenir");
    console.log("  - Admin kullanıcı ADMIN rolü ile oluşturulur");
    process.exit(1);
  }

  const [businessName, adminEmail, adminPassword, adminName] = args;

  console.log("\n🚀 İşletme oluşturuluyor...\n");

  try {
    // Check if admin email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.error(`❌ Hata: Bu e-posta adresi (${adminEmail}) zaten kullanımda.`);
      process.exit(1);
    }

    // Generate unique slug
    let slug = generateSlug(businessName);
    let slugExists = await prisma.business.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(businessName)}-${counter}`;
      slugExists = await prisma.business.findUnique({ where: { slug } });
      counter++;
    }

    // Create business
    const business = await prisma.business.create({
      data: {
        name: businessName,
        slug,
      },
    });
    console.log(`✅ İşletme oluşturuldu: ${business.name} (${business.slug})`);

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const user = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        emailVerified: true, // CLI created users are pre-verified
      },
    });
    console.log(`✅ Yönetici oluşturuldu: ${user.email}`);

    // Link user to business as admin
    await prisma.userBusiness.create({
      data: {
        userId: user.id,
        businessId: business.id,
        role: "ADMIN",
        isDefault: true,
      },
    });
    console.log(`✅ Kullanıcı işletmeye bağlandı (ADMIN)`);

    // Seed demo data
    await seedBusinessData(business.id);
    console.log(`✅ Demo veriler eklendi (3 müşteri, 3 ürün, 1 sipariş)`);

    console.log("\n🎉 İşletme başarıyla oluşturuldu!\n");
    console.log("📋 Giriş bilgileri:");
    console.log(`   İşletme: ${business.name}`);
    console.log(`   E-posta: ${user.email}`);
    console.log(`   Şifre: ${adminPassword}`);
    console.log("");

  } catch (error: any) {
    if (error.code === "P2002") {
      console.error(`❌ Hata: Benzersizlik kısıtlaması ihlali.`);
    } else {
      console.error("❌ İşletme oluşturulurken bir hata oluştu:", error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

