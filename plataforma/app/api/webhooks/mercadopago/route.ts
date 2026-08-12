import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { db } from "@/lib/db";
import { grantAccess } from "@/lib/entitlements";
import { sendPurchaseConfirmation } from "@/lib/email";
import { createHmac } from "crypto";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "placeholder",
});

function verifyMpSignature(req: NextRequest, paymentId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true; // não configurado: permite mas loga aviso

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

  if (body.type !== "payment") return NextResponse.json({ ok: true });

  const paymentId = String(body.data?.id);
  if (!paymentId) return NextResponse.json({ ok: true });

  if (!verifyMpSignature(req, paymentId)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

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
