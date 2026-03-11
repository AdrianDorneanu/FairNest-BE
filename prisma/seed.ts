import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL'],
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Welkom123!@#', salt);

  const user1 = await prisma.user.create({
    data: {
      email: 'adrian.dorneanu96@gmail.com',
      firstName: 'Adrian',
      lastName: 'Dorneanu',
      passwordHash,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'catalina.dospinescu02@gmail.com',
      firstName: 'Catalina-Elena',
      lastName: 'Dospinescu',
      passwordHash,
    },
  });

  await prisma.couple.create({
    data: {
      name: `${user1.firstName} & ${user2.firstName}`,
      users: {
        connect: [{ id: user1.id }, { id: user2.id }],
      },
    },
  });

  console.log('Seed complete: created 2 users in a couple');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
