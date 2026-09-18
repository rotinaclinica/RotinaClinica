import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";
import { sendEbookDownloadLinks } from "@/lib/email";

// Rate limiting: máx 5 submissões por IP em 10 minutos
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente em alguns minutos." }, { status: 429 });
  }
  try {
    const body = await req.json();
    const {
      name, email: rawEmail, phone, age, profile, doePlantoes,
      state, university, contentWish, contentFormat,
      contentFormatOther, previousPurchase, whatsappOptIn,
      productId,
      productIds, // bundle mode: array of product ids
    } = body;
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

    const hasBundle = Array.isArray(productIds) && productIds.length > 0;
    if (!name || !email || !email.includes("@") || !phone || !age || !profile || !doePlantoes ||
        !state || !university || !contentWish || !contentFormat ||
        !previousPurchase || (!productId && !hasBundle)) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    // Limites de tamanho: evita inflar o banco com payloads gigantes (DoS).
    const ids = hasBundle ? productIds : [productId];
    const tooLong =
      [name, email, phone, age, profile, doePlantoes, state, university,
       contentFormat, contentFormatOther, previousPurchase, ...ids]
        .some((v) => typeof v === "string" && v.length > 200) ||
      (typeof contentWish === "string" && contentWish.length > 2000);
    if (tooLong) {
      return NextResponse.json({ error: "Um dos campos excede o tamanho permitido." }, { status: 400 });
    }

    if (hasBundle) {
      // Bundle mode: validate all products, create one lead per product
      if (productIds.length > 10) {
        return NextResponse.json({ error: "Muitos produtos" }, { status: 400 });
      }
      const products = await db.product.findMany({
        where: { id: { in: productIds }, type: "EBOOK_FREE" },
      });
      if (products.length === 0) {
        return NextResponse.json({ error: "Produtos não encontrados" }, { status: 404 });
      }

      const leadBase = {
        name, email, phone, age, profile, doePlantoes,
        state, university, contentWish, contentFormat,
        contentFormatOther: contentFormatOther || null,
        previousPurchase,
        whatsappOptIn: whatsappOptIn === true,
      };
      await db.$transaction(
        products.map((p) => db.lead.create({ data: { id: randomUUID(), ...leadBase, productId: p.id } }))
      );

      const downloadsPayload = products.map((p) => ({
        title: p.title,
        slug: p.slug,
        url: p.fileKey ? `/api/download/${p.slug}` : null,
      }));

      // Send email with download links (non-blocking)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.rotinaclinica.com.br";
      sendEbookDownloadLinks({ to: email, name, downloads: downloadsPayload, appUrl }).catch(
        (err) => console.error("[leads/bundle] email error:", err)
      );

      return NextResponse.json({ success: true, downloads: downloadsPayload });
    }

    // Single product mode (existing behavior)
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
