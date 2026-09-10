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
    console.error(`[download:${slug}] produto sem fileKey (não configurado)`);
    return NextResponse.json({ error: "Arquivo não disponível" }, { status: 404 });
  }

  let result;
  try {
    result = await getPrivateBlob(product.fileKey);
  } catch (err) {
    const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;
    console.error(
      `[download:${slug}] falha ao ler do Blob (tokenPresente=${hasToken}):`,
      err instanceof Error ? err.message : String(err)
    );
    return NextResponse.json({ error: "Erro ao buscar arquivo" }, { status: 500 });
  }

  if (!result || result.statusCode !== 200 || !result.stream) {
    console.error(`[download:${slug}] Blob get statusCode ${result?.statusCode ?? "null"}`);
    return NextResponse.json({ error: "Erro ao buscar arquivo" }, { status: 500 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/pdf",
      "Content-Disposition": `attachment; filename="${slug}.pdf"`,
    },
  });
}
