import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import fs from "fs";
import path from "path";

const EBOOKS: Record<string, { file: string; name: string }> = {
  "guia-prescricoes": {
    file: "Guia de prescrições Rotina Clínica (1).pdf",
    name: "Guia de Prescrições — Rotina Clínica",
  },
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (!subscription || subscription.status !== "ACTIVE") {
    return NextResponse.json({ error: "Assinatura inativa" }, { status: 403 });
  }

  const { id } = await params;
  const ebook = EBOOKS[id];
  if (!ebook) {
    return NextResponse.json({ error: "Ebook não encontrado" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", "ebook", ebook.file);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Arquivo não disponível" }, { status: 500 });
  }

  const pdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const userEmail = session.user.email;
  const downloadDate = new Date().toLocaleDateString("pt-BR");
  const watermarkText = `${userEmail} — baixado em ${downloadDate} — uso pessoal e intransferível`;

  const pages = pdfDoc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    const fontSize = 7.5;
    const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
    page.drawText(watermarkText, {
      x: (width - textWidth) / 2,
      y: 10,
      size: fontSize,
      font,
      color: rgb(1, 1, 1),
      opacity: 0.85,
    });
  }

  const watermarkedBytes = await pdfDoc.save();

  const filename = `${ebook.name} — ${userEmail}.pdf`
    .replace(/[^a-zA-Z0-9À-ÿ\s\-–—.]/g, "")
    .trim();

  return new NextResponse(Buffer.from(watermarkedBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
