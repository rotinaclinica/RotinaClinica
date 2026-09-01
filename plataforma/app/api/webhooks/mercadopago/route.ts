import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { db } from "@/lib/db";
import { sendPurchaseConfirmation } from "@/lib/email";
import { grantAccess } from "@/lib/entitlements";
import { createPendingInvoiceForOrder } from "@/lib/nfe";
import { createHmac } from "crypto";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "placeholder",
});

function verifyMpSignature(req: NextRequest, paymentId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return false;

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  const parts = Object.fromEntries(xSignature.split(",").map((p) => p.split("=")));
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${paymentId};request-id:${xRequestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  return expected === v1;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const paymentId = String(body.data?.id ?? "");
  if (!verifyMpSignature(req, paymentId)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (body.type !== "payment") return NextResponse.json({ ok: true });
  if (!paymentId) return NextResponse.json({ ok: true });

  const eventKey = `mp_payment_${paymentId}`;
  const existing = await db.webhookEvent.findUnique({ where: { externalId: eventKey } });
  if (existing) return NextResponse.json({ ok: true });

  const payment = new Payment(client);
  const paymentData = await payment.get({ id: paymentId });

  const orderId = paymentData.external_reference;
  if (!orderId) return NextResponse.json({ ok: true });

  if (paymentData.status === "approved") {
    await db.webhookEvent.create({
      data: { provider: "MERCADOPAGO", externalId: eventKey },
    });

    const order = await db.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paymentMethod: paymentData.payment_type_id ?? "unknown",
        providerRef: paymentId,
      },
      include: { items: { include: { product: true } } },
    });

    const user = await db.user.findUnique({ where: { id: order.userId } });
    const now = new Date();

    for (const item of order.items) {
      await grantAccess(order.userId, item.productId, order.id);

      if (item.product.type === "SUBSCRIPTION") {
        // Assinatura: cria ou renova. Estende a partir do fim vigente (se ativo)
        // para renovação/troca não descartar tempo já pago.
        const isAnnual = item.product.slug === "assinatura-anual";
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
            provider: "MERCADOPAGO",
            providerRef: paymentId,
          },
          update: {
            plan: isAnnual ? "ANNUAL" : "MONTHLY",
            status: "ACTIVE",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            providerRef: paymentId,
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
      }
    }

    // Enfileira a emissão da nota fiscal (no-op se NFE_ENABLED != true).
    // Nunca deve quebrar a confirmação de pagamento — daí o catch.
    await createPendingInvoiceForOrder(order.id).catch(() => {});
  } else if (paymentData.status === "rejected" || paymentData.status === "cancelled") {
    await db.order.updateMany({
      where: { id: orderId, status: "PENDING" },
      data: { status: "FAILED" },
    });
  }

  return NextResponse.json({ ok: true });
}
