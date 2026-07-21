import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_SALT_ROUNDS = 12;

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@arimasgym.com';
  const password = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';
  const fullName = process.env.ADMIN_FULL_NAME ?? 'Gym Admin';

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      email,
      passwordHash,
      fullName,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(`Seeded admin user: ${admin.email} (role=${admin.role})`);
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
