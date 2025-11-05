import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a test organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'black-edition' },
    update: {},
    create: {
      clerkId: 'org_test_blackedition',
      name: 'Black Edition Agency',
      slug: 'black-edition',
      settings: {
        timezone: 'UTC',
        currency: 'USD',
      },
    },
  });

  console.log('✅ Created organization:', organization.name);

  // Create a test admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@blackedition.com' },
    update: {},
    create: {
      clerkId: 'user_test_admin',
      email: 'admin@blackedition.com',
      name: 'Admin User',
      role: 'ADMIN',
      organizationId: organization.id,
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
