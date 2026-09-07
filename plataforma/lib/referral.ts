import { db } from "@/lib/db";

export async function processReferral(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true, totalCents: true, ambassadorCode: true, referral: { select: { id: true } } },
  });

  if (!order?.ambassadorCode || order.referral) return;

  const ambassador = await db.user.findUnique({
    where: { ambassadorCode: order.ambassadorCode, isAmbassador: true },
    select: { id: true, subscription: { select: { status: true, currentPeriodEnd: true } } },
  });

  if (!ambassador) return;
  // O próprio embaixador não pode ser indicado por si mesmo
  if (ambassador.id === order.userId) return;

  // Cada usuário só pode ter um referral (unique em referredUserId)
  const alreadyReferred = await db.referral.findUnique({ where: { referredUserId: order.userId } });
  if (alreadyReferred) return;

  const commissionCents = Math.round(order.totalCents * 0.1);

  await db.referral.create({
    data: {
      ambassadorId: ambassador.id,
      referredUserId: order.userId,
      orderId: order.id,
      paymentAmountCents: order.totalCents,
      commissionCents,
    },
  });

  // A cada 2 referrals confirmados, o embaixador ganha 1 mês grátis
  const totalReferrals = await db.referral.count({ where: { ambassadorId: ambassador.id } });
  const prevCount = totalReferrals - 1;
  if (Math.floor(totalReferrals / 2) > Math.floor(prevCount / 2)) {
    const now = new Date();
    const sub = ambassador.subscription;
    const base = sub && sub.status === "ACTIVE" && sub.currentPeriodEnd > now
      ? new Date(sub.currentPeriodEnd)
      : new Date(now);
    const newEnd = new Date(base);
    newEnd.setDate(newEnd.getDate() + 30);

    await db.subscription.upsert({
      where: { userId: ambassador.id },
      update: { currentPeriodEnd: newEnd },
      create: {
        userId: ambassador.id,
        plan: "MONTHLY",
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: newEnd,
        provider: "STRIPE",
        providerRef: `ambassador_bonus_${orderId}`,
      },
    });
  }
}
