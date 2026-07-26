import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { db } from "@/lib/db";
import { grantAccess } from "@/lib/entitlements";
import { sendPurchaseConfirmation } from "@/lib/email";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "placeholder",
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type !== "payment") return NextResponse.json({ ok: true });

  const paymentId = String(body.data?.id);
  if (!paymentId) return NextResponse.json({ ok: true });

  // Idempotência
  const eventKey = `mp_payment_${paymentId}`;
  const existing = await db.webhookEvent.findUnique({
    where: { externalId: eventKey },
  });

  const payment = new Payment(client);
  const paymentData = await payment.get({ id: paymentId });

  const orderId = paymentData.external_reference;
  if (!orderId) return NextResponse.json({ ok: true });

  if (paymentData.status === "approved") {
    if (!existing) {
      await db.webhookEvent.create({
        data: { provider: "MERCADOPAGO", externalId: eventKey },
      });
    }

    const order = await db.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paymentMethod: paymentData.payment_type_id ?? "unknown",
      },
      include: { items: true },
    });

    const user = await db.user.findUnique({ where: { id: order.userId } });

    for (const item of order.items) {
      await grantAccess(order.userId, item.productId, orderId);
    }

    if (user?.email) {
      const product = await db.product.findUnique({ where: { id: order.items[0]?.productId } });
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
  } else if (paymentData.status === "rejected" || paymentData.status === "cancelled") {
    await db.order.updateMany({
      where: { id: orderId, status: "PENDING" },
      data: { status: "FAILED" },
    });
  }

  return NextResponse.json({ ok: true });
}
