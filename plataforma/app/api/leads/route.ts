import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, email, phone, age, profile, doePlantoes,
      state, university, contentWish, contentFormat,
      contentFormatOther, previousPurchase, whatsappOptIn,
      productId,
    } = body;

    if (!name || !email || !phone || !age || !profile || !doePlantoes ||
        !state || !university || !contentWish || !contentFormat ||
        !previousPurchase || !productId) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product || product.type !== "EBOOK_FREE") {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    await db.lead.create({
      data: {
        id: randomUUID(),
        name, email, phone, age, profile, doePlantoes,
        state, university, contentWish, contentFormat,
        contentFormatOther: contentFormatOther || null,
        previousPurchase,
        whatsappOptIn: whatsappOptIn === true,
        productId,
      },
    });

    return NextResponse.json({
      success: true,
      downloadUrl: product.fileKey
        ? `/api/download/${product.slug}`
        : null,
    });
  } catch (err) {
    console.error("[leads] error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
