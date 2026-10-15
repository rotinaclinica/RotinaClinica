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
  autoRenew: boolean;
  plan: "MONTHLY" | "ANNUAL" | null;
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      isCourtesy: true,
      subscription: { select: { id: true, status: true, currentPeriodEnd: true, plan: true, asaasSubscriptionId: true } },
    },
  });

  const none = { canAccess: false, expiresAt: null, autoRenew: false, plan: null };
  if (!user) return none;
  if (user.role === "ADMIN" || user.role === "TESTER") return { ...none, canAccess: true };

  const sub = user.subscription;
  if (!sub || sub.status !== "ACTIVE") return none;

  if (sub.currentPeriodEnd.getTime() <= Date.now()) {
    await db.subscription.updateMany({
      where: { id: sub.id, status: "ACTIVE" },
      data: { status: "EXPIRED" },
    });
    return none;
  }

  return {
    canAccess: true,
    expiresAt: sub.currentPeriodEnd,
    // Cortesia não renova por cobrança: tratada como automática para não exibir o aviso
    autoRenew: !!sub.asaasSubscriptionId || user.isCourtesy,
    plan: sub.plan,
  };
}

// Quem paga avulso (Pix/transferência) pode renovar antecipadamente nos últimos
// dias — o webhook soma o novo período ao fim do atual, sem perder dias.
export const EARLY_RENEW_DAYS = 10;

/**
 * true quando o usuário já tem assinatura vigente que impede uma nova compra
 * do mesmo plano: recorrente no cartão (renova sozinha) ou avulsa com mais de
 * EARLY_RENEW_DAYS dias restantes.
 */
export async function hasBlockingSubscription(userId: string, plan: "MONTHLY" | "ANNUAL"): Promise<boolean> {
  const sub = await db.subscription.findUnique({
    where: { userId },
    select: { status: true, plan: true, currentPeriodEnd: true, asaasSubscriptionId: true },
  });
  if (!sub || sub.status !== "ACTIVE" || sub.plan !== plan) return false;
  const msLeft = sub.currentPeriodEnd.getTime() - Date.now();
  if (msLeft <= 0) return false;
  if (sub.asaasSubscriptionId) return true;
  return msLeft > EARLY_RENEW_DAYS * 24 * 60 * 60 * 1000;
}

// ── Teste grátis ─────────────────────────────────────────────────────────────

export const TRIAL_DAYS = 7;

/** Seções liberadas durante o teste grátis (prefixos de rota do dashboard). */
export const TRIAL_ROUTES = ["/dashboard/prescricoes", "/dashboard/evolucoes", "/dashboard/calculadoras"];

export function isTrialRoute(pathname: string) {
  return TRIAL_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

/** Data de fim do teste, se estiver em andamento; null caso contrário. */
export async function getActiveTrialEnd(userId: string): Promise<Date | null> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { trialEndsAt: true } });
  const end = user?.trialEndsAt;
  return end && end.getTime() > Date.now() ? end : null;
}

/**
 * Acesso às seções do teste (Condutas, Evoluções, Calculadoras):
 * assinante/ADMIN/TESTER ou usuário com teste em andamento.
 */
export async function canAccessTrialContent(userId: string): Promise<boolean> {
  if (await canAccessPaidContent(userId)) return true;
  return (await getActiveTrialEnd(userId)) !== null;
}

/**
 * Pode ativar o teste? Uma vez por conta, e nunca para quem já pagou
 * assinatura ou tem acesso por role/cortesia.
 */
export async function trialEligibility(userId: string): Promise<{ ok: true } | { ok: false; reason: "used" | "subscriber" }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, isCourtesy: true, trialStartedAt: true, subscription: { select: { id: true } } },
  });
  if (!user) return { ok: false, reason: "used" };
  if (user.role !== "CUSTOMER" || user.isCourtesy || user.subscription) return { ok: false, reason: "subscriber" };
  if (user.trialStartedAt) return { ok: false, reason: "used" };
  return { ok: true };
}

/** Ativa o teste se elegível. updateMany com trialStartedAt null: chamadas repetidas não reiniciam. */
export async function activateTrial(userId: string): Promise<boolean> {
  if (!(await trialEligibility(userId)).ok) return false;
  const now = new Date();
  const { count } = await db.user.updateMany({
    where: { id: userId, trialStartedAt: null },
    data: { trialStartedAt: now, trialEndsAt: new Date(now.getTime() + TRIAL_DAYS * 86_400_000) },
  });
  return count > 0;
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
