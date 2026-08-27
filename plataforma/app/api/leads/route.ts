import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

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
    } = body;
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

    if (!name || !email || !email.includes("@") || !phone || !age || !profile || !doePlantoes ||
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
