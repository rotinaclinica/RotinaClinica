import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

function htmlToPlain(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/ul>/gi, "\n")
    .replace(/<\/ol>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const note = await db.note.findUnique({ where: { id, userId: session.user.id } });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PDFDocument = require("pdfkit") as typeof import("pdfkit");
  const doc = new PDFDocument({ margin: 56, size: "A4" });
  const chunks: Buffer[] = [];

  await new Promise<void>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", resolve);
    doc.on("error", reject);

    // Faixa de cor no topo
    doc.rect(0, 0, doc.page.width, 6).fill("#0f2d4a");
    doc.y = 56;

    // Título
    const title = note.title || "Anotação";
    doc.fontSize(20).font("Helvetica-Bold").fillColor("#0f2d4a").text(title);
    doc.moveDown(0.4);
    doc
      .moveTo(56, doc.y)
      .lineTo(doc.page.width - 56, doc.y)
      .strokeColor("#e2e8f0")
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.5);

    // Data
    const date = note.updatedAt.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    doc.fontSize(9).font("Helvetica").fillColor("#94a3b8").text(`Atualizado em ${date}`);
    doc.moveDown(0.8);

    // Conteúdo
    const plain = htmlToPlain(note.content);
    if (plain) {
      doc.fontSize(11).font("Helvetica").fillColor("#1a1a1a").text(plain, {
        lineGap: 3,
        paragraphGap: 6,
      });
    }

    doc.end();
  });

  const pdf = Buffer.concat(chunks);
  const safeTitle = (note.title || "anotacao")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 60) || "anotacao";

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeTitle}.pdf"`,
      "Content-Length": String(pdf.length),
    },
  });
}
