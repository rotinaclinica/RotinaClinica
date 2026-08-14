import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createMpPreference } from "@/lib/payments/mercadopago";
import { z } from "zod";

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
  const preference = await createMpPreference({
    orderId: order.id,
    productTitle: product.title,
    priceCents: product.priceCents,
    customerEmail: session.user.email!,
    successUrl: `${appUrl}/pedido/${order.id}?status=sucesso`,
    failureUrl: `${appUrl}/pedido/${order.id}?status=falha`,
    pendingUrl: `${appUrl}/pedido/${order.id}?status=pendente`,
  });

  await db.order.update({
    where: { id: order.id },
    data: { providerRef: preference.id ?? "unknown" },
  });

  return NextResponse.json({ url: preference.init_point ?? preference.sandbox_init_point });
}
