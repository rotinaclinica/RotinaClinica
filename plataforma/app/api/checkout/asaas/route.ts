import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { logError } from "@/lib/error-logger";
import {
  createAsaasCustomer,
  createAsaasPixPayment,
  createAsaasCardPayment,
} from "@/lib/payments/asaas";

const baseSchema = z.object({
  productId: z.string(),
  method: z.enum(["pix", "card"]),
  ambassadorCode: z.string().optional(),
  installments: z.number().int().min(1).max(12).optional(),
});

const cardSchema = baseSchema.extend({
  method: z.literal("card"),
  card: z.object({
    holderName: z.string().min(1),
    number: z.string().min(13).max(19).transform((v) => v.replace(/\s/g, "")),
    expiryMonth: z.string().length(2),
    expiryYear: z.string().min(2).max(4),
    ccv: z.string().min(3).max(4),
  }),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const base = baseSchema.safeParse(body);
  if (!base.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const [product, user] = await Promise.all([
    db.product.findUnique({ where: { id: base.data.productId, active: true } }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { cpf: true, name: true, email: true, phone: true },
    }),
  ]);

  if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  if (!user?.cpf) {
    return NextResponse.json(
      { error: "CPF é necessário para emitir a nota fiscal.", code: "CPF_REQUIRED" },
      { status: 400 }
    );
  }

  if (product.type === "SUBSCRIPTION") {
    const isAnnual = product.slug === "assinatura-anual";
    const existing = await db.subscription.findUnique({
      where: { userId: session.user.id },
      select: { status: true, plan: true },
    });
    if (existing?.status === "ACTIVE" && existing.plan === (isAnnual ? "ANNUAL" : "MONTHLY")) {
      return NextResponse.json({ error: "Você já possui esta assinatura ativa." }, { status: 409 });
    }
  }

  const code = base.data.ambassadorCode?.trim().toUpperCase() || undefined;
  if (code) {
    const amb = await db.user.findUnique({
      where: { ambassadorCode: code, isAmbassador: true },
      select: { id: true },
    });
    if (!amb) {
      return NextResponse.json(
        { error: "Código de embaixador inválido.", code: "INVALID_AMBASSADOR_CODE" },
        { status: 400 }
      );
    }
  }

  try {
    const order = await db.order.create({
      data: {
        userId: session.user.id,
        provider: "ASAAS",
        providerRef: "pending",
        totalCents: product.priceCents,
        currency: product.currency,
        ambassadorCode: code,
        items: { create: [{ productId: product.id, priceCents: product.priceCents }] },
      },
    });

    const customerId = await createAsaasCustomer({
      name: user.name ?? session.user.name ?? "Cliente",
      email: session.user.email!,
      cpfCnpj: user.cpf.replace(/\D/g, ""),
      externalReference: session.user.id,
    });

    if (base.data.method === "pix") {
      const pix = await createAsaasPixPayment({
        customerId,
        orderId: order.id,
        valueCents: product.priceCents,
      });

      await db.order.update({
        where: { id: order.id },
        data: { providerRef: pix.paymentId },
      });

      return NextResponse.json({
        orderId: order.id,
        qrCodeBase64: pix.qrCodeBase64,
        pixCode: pix.pixCode,
      });
    }

    // Cartão
    const parsed = cardSchema.safeParse(body);
    if (!parsed.success) {
      await db.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
      return NextResponse.json({ error: "Dados do cartão inválidos" }, { status: 400 });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "0.0.0.0";

    const payment = await createAsaasCardPayment({
      customerId,
      orderId: order.id,
      valueCents: product.priceCents,
      installments: parsed.data.installments ?? 1,
      card: parsed.data.card,
      holderInfo: {
        name: parsed.data.card.holderName,
        email: session.user.email!,
        cpfCnpj: user.cpf.replace(/\D/g, ""),
        phone: user.phone ?? undefined,
      },
      remoteIp: ip,
    });

    await db.order.update({
      where: { id: order.id },
      data: { providerRef: payment.paymentId },
    });

    // CONFIRMED = aprovado imediatamente
    if (payment.status === "CONFIRMED" || payment.status === "RECEIVED") {
      return NextResponse.json({ orderId: order.id, status: "confirmed" });
    }

    if (payment.status === "DECLINED" || payment.status === "REFUSED") {
      await db.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
      return NextResponse.json(
        { error: payment.failReason ?? "Cartão recusado. Verifique os dados e tente novamente." },
        { status: 422 }
      );
    }

    return NextResponse.json({ orderId: order.id, status: payment.status });
  } catch (err) {
    await logError({ route: "/api/checkout/asaas", method: "POST", error: err, userId: session.user.id });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao processar pagamento." },
      { status: 500 }
    );
  }
}
