import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Function to generate URL-friendly slug
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

// Function to seed demo data for a business
export async function seedBusinessData(businessId: string) {
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
  console.log("🌱 Veritabanı seed işlemi başlatılıyor...\n");

  // Create demo business
  const business = await prisma.business.upsert({
    where: { slug: "ornek-ticaret" },
    update: {},
    create: {
      name: "Örnek Ticaret",
      slug: "ornek-ticaret",
      address: "Örnek Mah. No:1, Kadıköy/İstanbul",
      phone: "0212 123 4567",
      email: "info@ornekticaret.com",
      taxNumber: "1234567890",
    },
  });
  console.log("✅ İşletme oluşturuldu:", business.name);

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@isletme.com" },
    update: { emailVerified: true },
    create: {
      email: "admin@isletme.com",
      password: hashedPassword,
      name: "Yönetici",
      emailVerified: true, // Demo user is pre-verified
    },
  });
  console.log("✅ Admin kullanıcısı oluşturuldu:", admin.email);

  // Link admin to business
  await prisma.userBusiness.upsert({
    where: {
      userId_businessId: {
        userId: admin.id,
        businessId: business.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      businessId: business.id,
      role: "ADMIN",
      isDefault: true,
    },
  });
  console.log("✅ Kullanıcı işletmeye bağlandı");

  // Check if business already has data
  const existingCustomers = await prisma.customer.count({
    where: { businessId: business.id },
  });

  if (existingCustomers === 0) {
    await seedBusinessData(business.id);
    console.log("✅ Demo veriler oluşturuldu");
  } else {
    console.log("ℹ️  Demo veriler zaten mevcut, atlanıyor");
  }

  console.log("\n🎉 Seed işlemi tamamlandı!");
  console.log("\n📋 Giriş bilgileri:");
  console.log("   E-posta: admin@isletme.com");
  console.log("   Şifre: admin123");
  console.log("   İşletme:", business.name);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
