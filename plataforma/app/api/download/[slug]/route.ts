import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getEbookDownloadUrl } from "@/lib/blob";

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

  const url = await getEbookDownloadUrl(product.fileKey);
  return NextResponse.redirect(url);
}
