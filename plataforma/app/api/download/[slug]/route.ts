import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPrivateBlob } from "@/lib/blob";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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
