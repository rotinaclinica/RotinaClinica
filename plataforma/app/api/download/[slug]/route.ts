import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

  const blobRes = await fetch(product.fileKey, {
    headers: {
      Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
    },
  });

  if (!blobRes.ok) {
    return NextResponse.json({ error: "Erro ao buscar arquivo" }, { status: 500 });
  }

  const filename = `${slug}.pdf`;

  return new NextResponse(blobRes.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
