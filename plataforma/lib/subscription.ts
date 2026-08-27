import { db } from "@/lib/db";

/**
 * Fonte única de verdade para acesso a conteúdo pago.
 *
 * Regras:
 * - ADMIN e TESTER têm acesso irrestrito.
 * - Demais usuários precisam de assinatura ACTIVE *e* dentro do período vigente.
 * - Se o período venceu, a assinatura é marcada como EXPIRED no primeiro acesso
 *   após o vencimento (expiração preguiçosa — dispensa cron job).
 *
 * A role é lida do banco, nunca da sessão: o JWT pode estar desatualizado
 * (ver lib/auth.ts, que revalida a role periodicamente).
 */
export async function canAccessPaidContent(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      subscription: { select: { id: true, status: true, currentPeriodEnd: true } },
    },
  });

  if (!user) return false;
  if (user.role === "ADMIN" || user.role === "TESTER") return true;

  const sub = user.subscription;
  if (!sub || sub.status !== "ACTIVE") return false;

  if (sub.currentPeriodEnd.getTime() <= Date.now()) {
    await db.subscription.updateMany({
      where: { id: sub.id, status: "ACTIVE" },
      data: { status: "EXPIRED" },
    });
    return false;
  }

  return true;
}

/**
 * Versão estendida para uso no dashboard layout: retorna o acesso E a data de
 * expiração em uma única query, evitando round-trip duplo.
 */
export async function checkSubscriptionAccess(userId: string): Promise<{
  canAccess: boolean;
  expiresAt: Date | null;
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      subscription: { select: { id: true, status: true, currentPeriodEnd: true } },
    },
  });

  if (!user) return { canAccess: false, expiresAt: null };
  if (user.role === "ADMIN" || user.role === "TESTER") return { canAccess: true, expiresAt: null };

  const sub = user.subscription;
  if (!sub || sub.status !== "ACTIVE") return { canAccess: false, expiresAt: null };

  if (sub.currentPeriodEnd.getTime() <= Date.now()) {
    await db.subscription.updateMany({
      where: { id: sub.id, status: "ACTIVE" },
      data: { status: "EXPIRED" },
    });
    return { canAccess: false, expiresAt: null };
  }

  return { canAccess: true, expiresAt: sub.currentPeriodEnd };
}

/**
 * Igual a canAccessPaidContent, mas sem a isenção de ADMIN/TESTER — para telas
 * que mostram o estado real da assinatura do próprio usuário.
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const sub = await db.subscription.findUnique({
    where: { userId },
    select: { id: true, status: true, currentPeriodEnd: true },
  });

  if (!sub || sub.status !== "ACTIVE") return false;

  if (sub.currentPeriodEnd.getTime() <= Date.now()) {
    await db.subscription.updateMany({
      where: { id: sub.id, status: "ACTIVE" },
      data: { status: "EXPIRED" },
    });
    return false;
  }

  return true;
}
