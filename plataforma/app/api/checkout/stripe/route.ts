import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createStripeCheckoutSession } from "@/lib/payments/stripe";
import { z } from "zod";
import { logError } from "@/lib/error-logger";

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

  // CPF é necessário para emitir a nota fiscal do pagamento. Bloqueia aqui
  // (não só no frontend) para garantir que toda venda por cartão tenha tomador.
  const buyer = await db.user.findUnique({
    where: { id: session.user.id },
    select: { cpf: true },
  });
  if (!buyer?.cpf) {
    return NextResponse.json(
      { error: "CPF é necessário para emitir a nota fiscal.", code: "CPF_REQUIRED" },
      { status: 400 }
    );
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

  try {
    const order = await db.order.create({
      data: {
        userId: session.user.id,
        provider: "STRIPE",
        providerRef: "pending",
        totalCents: product.priceCents,
        currency: product.currency,
        items: {
          create: [{ productId: product.id, priceCents: product.priceCents }],
        },
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const checkoutSession = await createStripeCheckoutSession({
      orderId: order.id,
      productTitle: product.title,
      priceCents: product.priceCents,
      currency: product.currency,
      customerEmail: session.user.email!,
      successUrl: `${appUrl}/pedido/${order.id}?status=sucesso`,
      cancelUrl: `${appUrl}/produtos/${product.slug}`,
    });

    await db.order.update({
      where: { id: order.id },
      data: { providerRef: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    await logError({ route: "/api/checkout/stripe", method: "POST", error: err, userId: session.user.id });
    return NextResponse.json({ error: "Erro ao criar sessão de pagamento." }, { status: 500 });
  }
}
