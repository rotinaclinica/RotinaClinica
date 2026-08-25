import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import fs from "fs";
import path from "path";

const EBOOKS: Record<string, { file: string; name: string; folder?: string }> = {
  "guia-prescricoes": {
    file: "Guia de prescrições Rotina Clínica (1).pdf",
    name: "Guia de Prescrições — Rotina Clínica",
  },
  "guia-intubacao": {
    file: "Guia de intubação orotraqueal, sedação e ventilação mecânica.pdf",
    name: "Guia de Intubação, Sedação e VM — Rotina Clínica",
  },
  "constipacao-intestinal": {
    file: "Abordagem da Constipação Intestinal.pdf",
    name: "Abordagem da Constipação Intestinal — Rotina Clínica",
    folder: "aulasconteudooffline",
  },
  "nauseas-vomitos": {
    file: "Abordagem de Náuseas e Vômitos.pdf",
    name: "Abordagem de Náuseas e Vômitos — Rotina Clínica",
    folder: "aulasconteudooffline",
  },
  "dor-analgesia": {
    file: "Dor e Analgesia.pdf",
    name: "Dor e Analgesia — Rotina Clínica",
    folder: "aulasconteudooffline",
  },
  "dengue": {
    file: "Aula Dengue.pdf",
    name: "Dengue — Rotina Clínica",
    folder: "aulasconteudooffline",
  },
  "drge": {
    file: "DRGE e suas complicações o essencial para o generalista.pdf",
    name: "DRGE e suas complicações — Rotina Clínica",
    folder: "aulasconteudooffline",
  },
  "disturbios-potassio": {
    file: "Distúrbios do Potássio.pdf",
    name: "Distúrbios do Potássio — Rotina Clínica",
    folder: "aulasconteudooffline",
  },
  "disturbios-sodio": {
    file: "Distúrbios do Sódio.pdf",
    name: "Distúrbios do Sódio — Rotina Clínica",
    folder: "aulasconteudooffline",
  },
  "prescricao-racional": {
    file: "Prescrição Racional.pdf",
    name: "Prescrição Racional — Rotina Clínica",
    folder: "aulasconteudooffline",
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

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  const isPrivileged = user?.role === "ADMIN" || user?.role === "TESTER";

  if (!isPrivileged) {
    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
    });
    if (!subscription || subscription.status !== "ACTIVE") {
      return NextResponse.json({ error: "Assinatura inativa" }, { status: 403 });
    }
  }

  const { id } = await params;
  const ebook = EBOOKS[id];
  if (!ebook) {
    return NextResponse.json({ error: "Ebook não encontrado" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", ebook.folder ?? "ebook", ebook.file);
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
      color: rgb(0.65, 0.65, 0.65),
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
