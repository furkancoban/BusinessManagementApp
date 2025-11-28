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

export async function seedBusinessData(businessId: string) {
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        businessId,
        name: "Ahmet Yılmaz",
        phone: "0532 123 4567",
        email: "ahmet@email.com",
        address: "Kadıköy, İstanbul",
        notes: "VIP müşteri",
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
      },
    }),
  ]);

  const products = await Promise.all([
    prisma.product.create({
      data: {
        businessId,
        name: "Örnek Ürün 1",
        sku: "URN-001",
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
        category: "Aksesuar",
        purchasePrice: 50,
        sellPrice: 80,
        stockQuantity: 100,
      },
    }),
  ]);

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
  console.log("🌱 Seeding database...\n");

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
  console.log("✅ Business created:", business.name);

  const hashedPassword = await bcrypt.hash("admin123", 12);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@isletme.com" },
    update: { emailVerified: true },
    create: {
      email: "admin@isletme.com",
      password: hashedPassword,
      name: "Yönetici",
      emailVerified: true,
    },
  });
  console.log("✅ Admin created:", admin.email);

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

  const existingCustomers = await prisma.customer.count({
    where: { businessId: business.id },
  });

  if (existingCustomers === 0) {
    await seedBusinessData(business.id);
    console.log("✅ Demo data created");
  }

  console.log("\n🎉 Seed completed!");
  console.log("\n📋 Login credentials:");
  console.log("   Email: admin@isletme.com");
  console.log("   Password: admin123");
}

// Only run main() if this file is executed directly (not when imported)
if (require.main === module) {
  main()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}

