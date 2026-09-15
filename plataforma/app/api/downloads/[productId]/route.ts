import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasAccess } from "@/lib/entitlements";
import { getBlobBytes } from "@/lib/blob";
import { logError } from "@/lib/error-logger";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { productId } = await params;

  try {
    const product = await db.product.findUnique({
      where: { id: productId, type: "DOWNLOAD", active: true },
    });
    if (!product?.fileKey) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const entitled = await hasAccess(session.user.id, productId);
    if (!entitled) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const pdfBytes = await getBlobBytes(product.fileKey);
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const userEmail = session.user.email;
    const downloadDate = new Date().toLocaleDateString("pt-BR");
    const watermarkText = `${userEmail} — baixado em ${downloadDate} — uso pessoal e intransferível`;

    for (const page of pdfDoc.getPages()) {
      const { width } = page.getSize();
      const fontSize = 7.5;
      const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
      page.drawText(watermarkText, {
        x: (width - textWidth) / 2,
        y: 10,
        size: fontSize,
        font,
        color: rgb(0.65, 0.65, 0.65),
        opacity: 0.85,
      });
    }

    const watermarkedBytes = await pdfDoc.save();

    const filename = `${product.title} — ${userEmail}.pdf`
      .replace(/[^a-zA-Z0-9À-ÿ\s\-–—.]/g, "")
      .trim();

    return new NextResponse(Buffer.from(watermarkedBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    await logError({ route: `/api/downloads/${productId}`, method: "GET", error: err, userId: session.user.id });
    return NextResponse.json({ error: "Erro ao gerar link de download." }, { status: 500 });
  }
}
