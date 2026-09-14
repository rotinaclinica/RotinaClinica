import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { code, productId } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Código inválido" }, { status: 400 });
  }

  const coupon = await db.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: { products: { select: { id: true } } },
  });

  if (!coupon || !coupon.active) {
    return NextResponse.json({ error: "Cupom não encontrado ou inativo." }, { status: 404 });
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: "Este cupom expirou." }, { status: 410 });
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "Este cupom já atingiu o limite de usos." }, { status: 410 });
  }

  if (productId && coupon.products.length > 0) {
    const validForProduct = coupon.products.some((p) => p.id === productId);
    if (!validForProduct) {
      return NextResponse.json({ error: "Este cupom não é válido para este produto." }, { status: 400 });
    }
  }

  const product = productId
    ? await db.product.findUnique({ where: { id: productId }, select: { priceCents: true } })
    : null;

  if (product && coupon.minValueCents && product.priceCents < coupon.minValueCents) {
    return NextResponse.json({
      error: `Valor mínimo para este cupom: R$ ${(coupon.minValueCents / 100).toFixed(2).replace(".", ",")}`,
    }, { status: 400 });
  }

  let discountCents = 0;
  if (product) {
    discountCents =
      coupon.discountType === "PERCENT"
        ? Math.round((product.priceCents * coupon.discountValue) / 100)
        : coupon.discountValue;
    discountCents = Math.min(discountCents, product.priceCents);
  }

  return NextResponse.json({
    valid: true,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountCents,
  });
}
