const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const user = await db.user.findUnique({ where: { email: 'teste@teste.com' } });
  if (!user) { console.error('Usuário não encontrado'); process.exit(1); }
  console.log('Usuário:', user.id, user.email);

  const sub = await db.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      plan: 'ANNUAL',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date('2099-12-31'),
      provider: 'STRIPE',
      providerRef: 'test_manual',
    },
    update: {
      status: 'ACTIVE',
      plan: 'ANNUAL',
      currentPeriodEnd: new Date('2099-12-31'),
    },
  });

  console.log('Assinatura:', sub.id, sub.status, sub.currentPeriodEnd);
}

main().finally(() => db.$disconnect());
