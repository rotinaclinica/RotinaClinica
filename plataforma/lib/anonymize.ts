import { db } from "@/lib/db";
import { cancelAsaasSubscription } from "@/lib/payments/asaas";
import { logError } from "@/lib/error-logger";

export type AnonymizeResult =
  | { ok: true; userId: string; hadSubscription: boolean; gatewayResult: string | null }
  | { ok: false; error: string };

export type AnonymizeOptions = {
  userId: string;
  triggeredBy: "self" | string;
  reason?: string;
};

/**
 * Anonimiza uma conta de usuário. Preserva Order/Invoice/Subscription (obrigação
 * fiscal). Apaga sessões, contas OAuth, leads matching, notas e drips.
 *
 * ⚠️ Não descriptografa nada — a chamada assume que os dados sensíveis já estão
 * criptografados no banco. O snapshot fiscal (Order.buyerSnapshot) já foi gravado
 * no momento do pagamento e permanece intacto.
 */
export async function anonymizeUser({
  userId,
  triggeredBy,
  reason,
}: AnonymizeOptions): Promise<AnonymizeResult> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) return { ok: false, error: "Usuário não encontrado" };
  if (user.anonymizedAt) return { ok: false, error: "Conta já foi anonimizada" };

  // 1. Cancela assinatura recorrente no gateway (Asaas é o único com recurrence real)
  let gatewayResult: string | null = null;
  const hadSubscription = !!user.subscription && user.subscription.status === "ACTIVE";
  if (hadSubscription && user.subscription) {
    try {
      if (user.subscription.asaasSubscriptionId) {
        await cancelAsaasSubscription(user.subscription.asaasSubscriptionId);
        gatewayResult = "asaas:cancelled";
      } else {
        // Stripe/MP: sem recurrence real no gateway, só flag local
        gatewayResult = `${user.subscription.provider.toLowerCase()}:local_only`;
      }
    } catch (err) {
      await logError({ route: "anonymize", method: "cancelSubscription", error: err, userId });
      gatewayResult = `error:${(err as Error).message}`;
      // Não interrompe — a anonimização precisa continuar. Admin resolve o gateway depois.
    }
  }

  // 2. Anonimização em transação atômica
  const anonEmail = `deleted-${userId}@anonymized.local`;

  await db.$transaction([
    // Sessões e contas OAuth: apaga tudo (desloga de todos os dispositivos)
    db.session.deleteMany({ where: { userId } }),
    db.account.deleteMany({ where: { userId } }),

    // Drips e leads relacionados
    db.emailDrip.deleteMany({ where: { userId } }),
    db.lead.deleteMany({ where: { email: user.email } }),

    // Notas do usuário (decisão A: deletar)
    db.note.deleteMany({ where: { userId } }),

    // Assinatura: se estava ativa, marca como cancelada
    ...(hadSubscription
      ? [
          db.subscription.update({
            where: { userId },
            data: { status: "CANCELLED" as const, cancelledAt: new Date() },
          }),
        ]
      : []),

    // Usuário: apaga PII, mantém id/createdAt/orders
    db.user.update({
      where: { id: userId },
      data: {
        email: anonEmail,
        name: "Usuário removido",
        passwordHash: null,
        cpf: null,
        cpfHash: null,
        phone: null,
        cep: null,
        momentoProfissional: null,
        ambienteTrabalho: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        referrerUrl: null,
        ambassadorCode: null,
        isAmbassador: false,
        lastSeenAt: null,
        anonymizedAt: new Date(),
      },
    }),

    // Registro de auditoria (LGPD Art. 37)
    db.anonymizationLog.create({
      data: {
        userId,
        triggeredBy,
        reason: reason ?? null,
        hadSubscription,
        gatewayResult,
      },
    }),
  ]);

  return { ok: true, userId, hadSubscription, gatewayResult };
}
