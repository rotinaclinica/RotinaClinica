import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { db } from "@/lib/db";
import { grantAccess } from "@/lib/entitlements";
import { sendPurchaseConfirmation } from "@/lib/email";

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
