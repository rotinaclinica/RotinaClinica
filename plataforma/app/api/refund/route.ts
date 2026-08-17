import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/payments/stripe";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { z } from "zod";

const schema = z.object({ orderId: z.string() });

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "placeholder",
});

const REFUND_WINDOW_DAYS = 7;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { items: true },
  });

  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  if (order.status !== "PAID") {
    return NextResponse.json({ error: "Este pedido não pode ser reembolsado." }, { status: 400 });
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
      const payment = new Payment(mpClient);
      await payment.refund({ id: order.providerRef, body: {} });
    }
  } catch (err) {
    console.error("Refund error:", err);
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
    db.subscription.updateMany({
      where: { userId: session.user.id, providerRef: order.providerRef },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
