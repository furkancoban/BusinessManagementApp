import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    console.log('\nUsage: npx tsx scripts/create-business.ts "Business Name" email@example.com password "Admin Name"\n');
    process.exit(1);
  }

  const [businessName, adminEmail, adminPassword, adminName] = args;

  let slug = generateSlug(businessName);
  let slugExists = await prisma.business.findUnique({ where: { slug } });
  let counter = 1;
  while (slugExists) { slug = `${generateSlug(businessName)}-${counter++}`; slugExists = await prisma.business.findUnique({ where: { slug } }); }

  const business = await prisma.business.create({ data: { name: businessName, slug } });
  console.log(`✅ Business created: ${business.name}`);

  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  const user = await prisma.user.create({ data: { name: adminName, email: adminEmail, password: hashedPassword, emailVerified: true } });
  console.log(`✅ Admin created: ${user.email}`);

  await prisma.userBusiness.create({ data: { userId: user.id, businessId: business.id, role: "ADMIN", isDefault: true } });
  console.log(`✅ User linked to business`);

  console.log(`\n🎉 Done! Login with: ${adminEmail} / ${adminPassword}\n`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

