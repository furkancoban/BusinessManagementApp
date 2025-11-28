import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Script to update product stock quantities for testing stock validation
 * This adds various stock levels to existing products
 */
async function main() {
  console.log("🔄 Ürün stok miktarları güncelleniyor...\n");

  try {
    // Get all businesses
    const businesses = await prisma.business.findMany();

    for (const business of businesses) {
      console.log(`📦 İşletme: ${business.name}`);

      // Get all products for this business
      const products = await prisma.product.findMany({
        where: { businessId: business.id },
      });

      if (products.length === 0) {
        console.log("   ⚠️  Bu işletmede ürün bulunamadı\n");
        continue;
      }

      // Update products with various stock levels
      const stockLevels = [2, 1, 0, 5, 50, 30, 100];
      let index = 0;

      for (const product of products) {
        const newStock = stockLevels[index % stockLevels.length];
        
        await prisma.product.update({
          where: { id: product.id },
          data: { stockQuantity: newStock },
        });

        console.log(`   ✅ ${product.name}: ${product.stockQuantity} → ${newStock} adet`);
        index++;
      }

      console.log("");
    }

    console.log("🎉 Stok güncelleme işlemi tamamlandı!");
    console.log("\n📋 Test Senaryoları:");
    console.log("   • 0 adet: Stokta olmayan ürün (eklenemez)");
    console.log("   • 1 adet: Kritik stok (sadece 1 adet sipariş verilebilir)");
    console.log("   • 2 adet: Düşük stok (maksimum 2 adet sipariş verilebilir)");
    console.log("   • 5 adet: Az stok (düşük stok uyarısı)");
    console.log("   • 30-100 adet: Normal stok seviyeleri");
  } catch (error) {
    console.error("❌ Hata:", error);
    throw error;
  }
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

