import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from "pdf-lib";

export const runtime = "nodejs";

function htmlToLines(html: string): string[] {
  const text = html
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
  return text.split("\n");
}

interface Ctx {
  doc: PDFDocument;
  pages: PDFPage[];
  font: PDFFont;
  margin: number;
  pageW: number;
  pageH: number;
  contentW: number;
  fontSize: number;
  lineH: number;
  y: number;
}

function nextPage(ctx: Ctx): PDFPage {
  const p = ctx.doc.addPage([ctx.pageW, ctx.pageH]);
  ctx.pages.push(p);
  ctx.y = ctx.pageH - ctx.margin;
  return p;
}

function currentPage(ctx: Ctx): PDFPage {
  return ctx.pages[ctx.pages.length - 1];
}

function ensureY(ctx: Ctx, needed: number): PDFPage {
  if (ctx.y - needed < ctx.margin) return nextPage(ctx);
  return currentPage(ctx);
}

function drawLine(ctx: Ctx, text: string, size: number, font: PDFFont, color: [number, number, number]) {
  const page = ensureY(ctx, size + 4);
  try {
    page.drawText(text, { x: ctx.margin, y: ctx.y, size, font, color: rgb(...color) });
  } catch {
    // character outside WinAnsi — skip silently
  }
  ctx.y -= size + 4;
}

function drawWrapped(ctx: Ctx, text: string) {
  if (!text.trim()) {
    ctx.y -= ctx.lineH * 0.5;
    return;
  }
  const words = text.split(/\s+/).filter(Boolean);
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    let w = 0;
    try { w = ctx.font.widthOfTextAtSize(test, ctx.fontSize); } catch { w = test.length * ctx.fontSize * 0.55; }
    if (w > ctx.contentW && line) {
      drawLine(ctx, line, ctx.fontSize, ctx.font, [0.1, 0.1, 0.1]);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) drawLine(ctx, line, ctx.fontSize, ctx.font, [0.1, 0.1, 0.1]);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const note = await db.note.findUnique({ where: { id, userId: session.user.id } });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pdfDoc = await PDFDocument.create();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pageW = 595.28;
  const pageH = 841.89;
  const margin = 56;
  const firstPage = pdfDoc.addPage([pageW, pageH]);

  const ctx: Ctx = {
    doc: pdfDoc,
    pages: [firstPage],
    font: regular,
    margin,
    pageW,
    pageH,
    contentW: pageW - margin * 2,
    fontSize: 11,
    lineH: 18,
    y: pageH - margin,
  };

  // Faixa azul no topo
  firstPage.drawRectangle({ x: 0, y: pageH - 6, width: pageW, height: 6, color: rgb(0.059, 0.176, 0.29) });
  ctx.y = pageH - margin - 8;

  // Título
  const titleText = (note.title || "Anotação").slice(0, 80);
  drawLine(ctx, titleText, 20, bold, [0.059, 0.176, 0.29]);
  ctx.y -= 4;

  // Divisor
  const divPage = ensureY(ctx, 4);
  divPage.drawLine({ start: { x: margin, y: ctx.y }, end: { x: pageW - margin, y: ctx.y }, thickness: 0.5, color: rgb(0.88, 0.91, 0.94) });
  ctx.y -= 14;

  // Data
  const date = note.updatedAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  drawLine(ctx, `Atualizado em ${date}`, 9, regular, [0.58, 0.66, 0.72]);
  ctx.y -= 10;

  // Conteúdo
  for (const line of htmlToLines(note.content)) {
    drawWrapped(ctx, line);
  }

  const pdfBytes = await pdfDoc.save();

  const safeTitle = (note.title || "anotacao")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "").trim()
    .replace(/\s+/g, "-").toLowerCase().slice(0, 60) || "anotacao";

  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeTitle}.pdf"`,
      "Content-Length": String(pdfBytes.length),
    },
  });
}
