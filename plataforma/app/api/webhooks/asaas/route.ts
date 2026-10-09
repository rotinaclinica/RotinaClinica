import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { grantAccess } from "@/lib/entitlements";
import { sendPurchaseConfirmation, sendNewSubscriberNotification, sendEbookSaleNotification, sendRefundNotification } from "@/lib/email";
import { logError } from "@/lib/error-logger";
import { createPendingInvoiceForOrder } from "@/lib/nfe";
import { processReferral } from "@/lib/referral";
import { verifyAsaasWebhook } from "@/lib/payments/asaas";

export async function POST(req: NextRequest) {
  const token = req.headers.get("asaas-access-token");
  if (!verifyAsaasWebhook(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = await req.json();
  const event: string = body.event ?? "";
  const payment = body.payment ?? {};
  const paymentId: string = payment.id ?? "";
  const orderId: string = payment.externalReference ?? "";
  const asaasSubscriptionId: string = payment.subscription ?? "";

  if (!paymentId) return NextResponse.json({ ok: true });

  // Idempotência: usa paymentId (sem evento) para que PAYMENT_RECEIVED e
  // PAYMENT_CONFIRMED não processem o mesmo pagamento duas vezes.
  const isPayment = event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED";
  const eventKey = isPayment ? `asaas_paid_${paymentId}` : `asaas_${event}_${paymentId}`;
  // Chaves legadas (antes de 13/09/2026) eram por evento; cartão recebe
  // PAYMENT_CONFIRMED na aprovação e PAYMENT_RECEIVED ~30 dias depois.
  const keys = isPayment
    ? [eventKey, `asaas_PAYMENT_CONFIRMED_${paymentId}`, `asaas_PAYMENT_RECEIVED_${paymentId}`]
    : [eventKey];
  const existing = await db.webhookEvent.findFirst({ where: { externalId: { in: keys } } });
  if (existing) return NextResponse.json({ ok: true });

  try {
    if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
      await db.webhookEvent.create({ data: { provider: "ASAAS", externalId: eventKey } });

      // ── Renovação automática de assinatura recorrente ──────────────────────
      // Quando o Asaas cobra automaticamente (mês 2+), o payment.subscription
      // existe mas não há uma Order nova — apenas estendemos o período.
      if (asaasSubscriptionId) {
        const existingSub = await db.subscription.findUnique({
          where: { asaasSubscriptionId },
          include: { user: true },
        });
        if (existingSub) {
          const now = new Date();
          const base =
            existingSub.status === "ACTIVE" && existingSub.currentPeriodEnd > now
              ? new Date(existingSub.currentPeriodEnd)
              : new Date(now);
          const periodEnd = new Date(base);
          periodEnd.setDate(periodEnd.getDate() + (existingSub.plan === "ANNUAL" ? 365 : 30));

          await db.subscription.update({
            where: { asaasSubscriptionId },
            data: {
              status: "ACTIVE",
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
              providerRef: paymentId,
              cancelledAt: null,
            },
          });

          // Não envia email de boas-vindas na renovação, só na primeira compra
          return NextResponse.json({ ok: true });
        }
      }

      // ── Primeiro pagamento (criado via checkout) ────────────────────────────
      if (!orderId) return NextResponse.json({ ok: true });

      // Pedido já liberado por este pagamento (ou por outra parcela do mesmo
      // parcelamento — cada parcela chega como um payment próprio): não
      // reprocessa (evita estender assinatura e reenviar boas-vindas).
      const current = await db.order.findUnique({ where: { id: orderId } });
      if (current?.status === "PAID" && (current.providerRef === paymentId || payment.installment)) {
        return NextResponse.json({ ok: true });
      }

      const order = await db.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          paidAt: new Date(),
          paymentMethod: payment.billingType === "PIX" ? "pix" : "credit_card",
          providerRef: paymentId,
        },
        include: { items: { include: { product: true } } },
      });

      const user = await db.user.findUnique({ where: { id: order.userId } });
      const now = new Date();

      for (const item of order.items) {
        await grantAccess(order.userId, item.productId, order.id);

        if (item.product.type === "SUBSCRIPTION") {
          const isAnnual = item.product.slug === "assinatura-anual";
          const existingSub = await db.subscription.findUnique({ where: { userId: order.userId } });
          const base =
            existingSub && existingSub.status === "ACTIVE" && existingSub.currentPeriodEnd > now
              ? new Date(existingSub.currentPeriodEnd)
              : new Date(now);
          const periodEnd = new Date(base);
          periodEnd.setDate(periodEnd.getDate() + (isAnnual ? 365 : 30));

          await db.subscription.upsert({
            where: { userId: order.userId },
            create: {
              userId: order.userId,
              plan: isAnnual ? "ANNUAL" : "MONTHLY",
              status: "ACTIVE",
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
              provider: "ASAAS",
              providerRef: paymentId,
              asaasSubscriptionId: asaasSubscriptionId || null,
            },
            update: {
              plan: isAnnual ? "ANNUAL" : "MONTHLY",
              status: "ACTIVE",
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
              provider: "ASAAS",
              providerRef: paymentId,
              asaasSubscriptionId: asaasSubscriptionId || undefined,
              cancelledAt: null,
            },
          });
        }
      }

      if (user?.email) {
        const product = order.items[0]?.product;
        if (product) {
          await sendPurchaseConfirmation({
            to: user.email,
            customerName: user.name ?? "Cliente",
            productTitle: product.title,
            productType: product.type,
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          }).catch(() => {});

          if (product.type === "SUBSCRIPTION") {
            const isAnnual = product.slug === "assinatura-anual";
            const method = payment.billingType === "PIX" ? "pix" : "asaas";
            await sendNewSubscriberNotification({
              customerName: user.name ?? "Cliente",
              customerEmail: user.email,
              paymentMethod: method,
              subscriptionPeriod: isAnnual ? "Anual (1 ano)" : "Mensal",
            }).catch(() => {});
          } else {
            await sendEbookSaleNotification({
              customerName: user.name ?? "Cliente",
              customerEmail: user.email,
              productTitle: product.title,
              valueCents: order.totalCents,
              paymentMethod: order.paymentMethod ?? "asaas",
            }).catch(() => {});
          }
        }
      }

      await createPendingInvoiceForOrder(order.id).catch(() => {});
      await processReferral(order.id).catch(() => {});
    } else if (event === "PAYMENT_REFUNDED" || event === "PAYMENT_CHARGEBACK_REQUESTED") {
      const order = await db.order.findUnique({ where: { id: orderId }, include: { user: true } });
      if (order?.user?.email) {
        await sendRefundNotification({
          customerName: order.user.name ?? "Cliente",
          customerEmail: order.user.email,
          amountCents: Math.round((payment.value ?? 0) * 100),
          paymentMethod: "asaas",
        }).catch(() => {});
      }
    } else if (event === "PAYMENT_OVERDUE" || event === "PAYMENT_DELETED") {
      await db.order.updateMany({
        where: { id: orderId, status: "PENDING" },
        data: { status: "FAILED" },
      });
    }
  } catch (err) {
    await logError({ route: "/api/webhooks/asaas", method: "POST", error: err });
  }

  return NextResponse.json({ ok: true });
}
