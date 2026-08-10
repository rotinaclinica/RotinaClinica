import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAulaById } from "@/lib/cursos-data";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; materialId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  const isPrivileged = user?.role === "ADMIN" || user?.role === "TESTER";

  if (!isPrivileged) {
    const sub = await db.subscription.findUnique({ where: { userId: session.user.id } });
    if (!sub || sub.status !== "ACTIVE") {
      return NextResponse.json({ error: "Assinatura inativa" }, { status: 403 });
    }
  }

  const { id, materialId } = await params;
  const aula = getAulaById(Number(id));
  if (!aula) {
    return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
  }

  const material = aula.materiais?.find((m) => m.id === materialId);
  if (!material) {
    return NextResponse.json({ error: "Material não encontrado" }, { status: 404 });
  }

  if (!aula.pasta) {
    return NextResponse.json({ error: "Material não disponível" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", aula.pasta, material.arquivo);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Arquivo não disponível" }, { status: 500 });
  }

  const pdfBytes = fs.readFileSync(filePath);
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
      color: rgb(1, 1, 1),
      opacity: 0.85,
    });
  }

  const watermarkedBytes = await pdfDoc.save();

  const filename = `${material.titulo} — ${userEmail}.pdf`
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
