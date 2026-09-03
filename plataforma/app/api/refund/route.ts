import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/payments/stripe";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/error-logger";

const schema = z.object({ orderId: z.string() });

const REFUND_WINDOW_DAYS = 7;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (!checkRateLimit(`refund:${session.user.id}`, session.user.id, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente em 1 hora." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { items: { include: { product: { select: { type: true } } } } },
  });

  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  if (order.status !== "PAID") {
    return NextResponse.json({ error: "Este pedido não pode ser reembolsado." }, { status: 400 });
  }

  // Bloqueia ciclos assinar→reembolsar→assinar→reembolsar: 1 reembolso de assinatura por usuário
  const hasSubscriptionItem = order.items.some((i) => i.product.type === "SUBSCRIPTION");
  if (hasSubscriptionItem) {
    const prevSubscriptionRefund = await db.order.findFirst({
      where: {
        userId: session.user.id,
        status: "REFUNDED",
        id: { not: order.id },
        items: { some: { product: { type: "SUBSCRIPTION" } } },
      },
      select: { id: true },
    });
    if (prevSubscriptionRefund) {
      return NextResponse.json(
        { error: "Você já utilizou o reembolso disponível. Entre em contato com o suporte." },
        { status: 400 }
      );
    }
  }

  if (!order.paidAt) {
    return NextResponse.json({ error: "Data de pagamento não encontrada." }, { status: 400 });
  }

  const daysSincePaid = (Date.now() - order.paidAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSincePaid > REFUND_WINDOW_DAYS) {
    return NextResponse.json(
      { error: `O prazo de ${REFUND_WINDOW_DAYS} dias para reembolso expirou.` },
      { status: 400 }
    );
  }

  try {
    if (order.provider === "STRIPE") {
      await stripe.refunds.create({ payment_intent: order.providerRef });
    } else if (order.provider === "MERCADOPAGO") {
      const res = await fetch(
        `https://api.mercadopago.com/v1/payments/${order.providerRef}/refunds`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      if (!res.ok) throw new Error(`MP refund failed: ${res.status}`);
    }
  } catch (err) {
    await logError({ route: "/api/refund", method: "POST", error: err, userId: session.user.id });
    return NextResponse.json(
      { error: "Erro ao processar reembolso. Entre em contato via suporte." },
      { status: 500 }
    );
  }

  await db.$transaction([
    db.order.update({
      where: { id: order.id },
      data: { status: "REFUNDED" },
    }),
    db.enrollment.deleteMany({
      where: {
        userId: session.user.id,
        productId: { in: order.items.map((i) => i.productId) },
      },
    }),
    // Reembolsar um pedido de assinatura cancela a assinatura do usuário —
    // por userId, não por providerRef. Se casássemos pelo providerRef, uma 2ª
    // compra teria trocado o providerRef da assinatura, e o reembolso do 1º
    // pedido não a cancelaria (usuário ficaria com acesso após ser reembolsado).
    ...(hasSubscriptionItem
      ? [
          db.subscription.updateMany({
            where: { userId: session.user.id },
            data: { status: "CANCELLED", cancelledAt: new Date() },
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ ok: true });
}
