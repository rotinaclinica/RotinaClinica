import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessPaidContent } from "@/lib/subscription";
import { getBlobBytes } from "@/lib/blob";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import fs from "fs";
import path from "path";

export const maxDuration = 60;

// Ebooks grandes (>50MB) são servidos do Vercel Blob (fora do bundle da
// Vercel); os menores continuam no public/ do deploy. `blobUrl` indica a via Blob.
const EBOOKS: Record<string, { file: string; name: string; folder?: string; blobUrl?: string }> = {
  "guia-prescricoes": {
    file: "Manual de prescrições Rotina Clínica.pdf",
    name: "Manual de Prescrições — Rotina Clínica",
    blobUrl: "https://ou9gedwcm8mxxcyr.private.blob.vercel-storage.com/ebooks/manual-prescricoes.pdf",
  },
  "guia-intubacao": {
    file: "Guia de intubação orotraqueal, sedação e ventilação mecânica.pdf",
    name: "Guia de Intubação, Sedação e VM — Rotina Clínica",
    blobUrl: "https://ou9gedwcm8mxxcyr.private.blob.vercel-storage.com/ebooks/guia-intubacao.pdf",
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
  "diarreia-cronica": {
    file: "Diarreia Crônica.pdf",
    name: "Diarreia Crônica — Rotina Clínica",
    folder: "aulasconteudooffline",
  },
  "enzimas-hepaticas": {
    file: "Enzimas Hepáticas, Icterícia e Cirrose Hepática.pdf",
    name: "Enzimas Hepáticas, Icterícia e Cirrose Hepática — Rotina Clínica",
    folder: "aulasconteudooffline",
  },
  "hepatites-virais": {
    file: "Hepatites Virais.pdf",
    name: "Hepatites Virais — Rotina Clínica",
    folder: "aulasconteudooffline",
  },
  "pancreatite": {
    file: "Pancreatite Aguda e Crônica.pdf",
    name: "Pancreatite Aguda e Crônica — Rotina Clínica",
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

  if (!(await canAccessPaidContent(session.user.id))) {
    return NextResponse.json({ error: "Assinatura inativa" }, { status: 403 });
  }

  const { id } = await params;
  const ebook = EBOOKS[id];
  if (!ebook) {
    return NextResponse.json({ error: "Ebook não encontrado" }, { status: 404 });
  }

  let pdfBytes: Buffer;
  if (ebook.blobUrl) {
    try {
      pdfBytes = await getBlobBytes(ebook.blobUrl);
    } catch (err) {
      const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;
      console.error(
        `[ebook:${id}] falha ao ler do Blob (tokenPresente=${hasToken}):`,
        err instanceof Error ? err.message : String(err)
      );
      return NextResponse.json({ error: "Arquivo não disponível" }, { status: 500 });
    }
  } else {
    const filePath = path.join(process.cwd(), "public", ebook.folder ?? "ebook", ebook.file);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Arquivo não disponível" }, { status: 500 });
    }
    pdfBytes = fs.readFileSync(filePath);
  }

  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Corrige o título interno do PDF (mostrado na barra do visualizador).
  // Os arquivos originais vinham com metadados como "NÃO EDITAR - BACKUP 2".
  pdfDoc.setTitle(ebook.name);
  pdfDoc.setAuthor("Rotina Clínica");
  pdfDoc.setSubject(ebook.name);

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
