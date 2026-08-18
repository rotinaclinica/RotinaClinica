import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPrivateBlob } from "@/lib/blob";

const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRate(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRate(ip)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um minuto." }, { status: 429 });
  }

  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug, type: "EBOOK_FREE", active: true },
  });

  if (!product?.fileKey) {
    return NextResponse.json({ error: "Arquivo não disponível" }, { status: 404 });
  }

  const result = await getPrivateBlob(product.fileKey);

  if (!result || result.statusCode !== 200) {
    return NextResponse.json({ error: "Erro ao buscar arquivo" }, { status: 500 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/pdf",
      "Content-Disposition": `attachment; filename="${slug}.pdf"`,
    },
  });
}
