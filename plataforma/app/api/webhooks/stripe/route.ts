import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { db } from "@/lib/db";
import { grantAccess } from "@/lib/entitlements";
import { sendPurchaseConfirmation, sendNewSubscriberNotification } from "@/lib/email";
import { createPendingInvoiceForOrder } from "@/lib/nfe";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotência
  const existing = await db.webhookEvent.findUnique({
    where: { externalId: event.id },
  });
  if (existing) return NextResponse.json({ ok: true });

  await db.webhookEvent.create({
    data: { provider: "STRIPE", externalId: event.id },
  });

  if (event.type === "checkout.session.completed") {
    const cs = event.data.object;
    const orderId = cs.metadata?.orderId;
    if (!orderId) return NextResponse.json({ ok: true });

    const order = await db.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paymentMethod: cs.payment_method_types?.[0] ?? "card",
        providerRef: (cs.payment_intent as string) ?? cs.id,
      },
      include: { items: { include: { product: true } } },
    });

    const user = await db.user.findUnique({ where: { id: order.userId } });
    const now = new Date();

    for (const item of order.items) {
      await grantAccess(order.userId, item.productId, orderId);

      if (item.product.type === "SUBSCRIPTION") {
        const isAnnual = item.product.slug === "assinatura-anual";
        // Estende a partir do fim vigente (se ainda ativo), para renovações/trocas
        // não descartarem tempo já pago. Caso contrário, começa de agora.
        const existing = await db.subscription.findUnique({ where: { userId: order.userId } });
        const base = existing && existing.status === "ACTIVE" && existing.currentPeriodEnd > now
          ? new Date(existing.currentPeriodEnd)
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
            provider: "STRIPE",
            providerRef: (cs.payment_intent as string) ?? cs.id,
          },
          update: {
            plan: isAnnual ? "ANNUAL" : "MONTHLY",
            status: "ACTIVE",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            provider: "STRIPE",
            providerRef: (cs.payment_intent as string) ?? cs.id,
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
          await sendNewSubscriberNotification({
            customerName: user.name ?? "Cliente",
            customerEmail: user.email,
            paymentMethod: "stripe",
            subscriptionPeriod: isAnnual ? "Anual (1 ano)" : "Mensal",
          }).catch(() => {});
        }
      }
    }

    // Enfileira a emissão da nota fiscal (no-op se NFE_ENABLED != true).
    // Nunca deve quebrar a confirmação de pagamento — daí o catch.
    await createPendingInvoiceForOrder(order.id).catch(() => {});
  }

  if (event.type === "checkout.session.expired") {
    const cs = event.data.object;
    const orderId = cs.metadata?.orderId;
    if (orderId) {
      await db.order.update({ where: { id: orderId }, data: { status: "EXPIRED" } });
    }
  }

  return NextResponse.json({ ok: true });
}
