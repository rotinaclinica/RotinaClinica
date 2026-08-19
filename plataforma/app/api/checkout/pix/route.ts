import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { z } from "zod";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "placeholder",
});

const schema = z.object({ productId: z.string() });

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

  const product = await db.product.findUnique({
    where: { id: parsed.data.productId, active: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  if (product.type === "SUBSCRIPTION") {
    const isAnnual = product.slug === "assinatura-anual";
    const targetPlan = isAnnual ? "ANNUAL" : "MONTHLY";
    const existingSub = await db.subscription.findUnique({
      where: { userId: session.user.id },
      select: { status: true, plan: true },
    });
    if (existingSub?.status === "ACTIVE" && existingSub.plan === targetPlan) {
      return NextResponse.json(
        { error: "Você já possui esta assinatura ativa." },
        { status: 409 }
      );
    }
  }

  const order = await db.order.create({
    data: {
      userId: session.user.id,
      provider: "MERCADOPAGO",
      providerRef: "pending",
      totalCents: product.priceCents,
      currency: product.currency,
      items: {
        create: [{ productId: product.id, priceCents: product.priceCents }],
      },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const payment = new Payment(client);

  const result = await payment.create({
    body: {
      transaction_amount: product.priceCents / 100,
      payment_method_id: "pix",
      payer: { email: session.user.email! },
      external_reference: order.id,
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
    },
  });

  await db.order.update({
    where: { id: order.id },
    data: { providerRef: String(result.id ?? "unknown") },
  });

  return NextResponse.json({ orderId: order.id });
}
