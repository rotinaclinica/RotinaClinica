"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type PdfCard = { label: string; value: string; sub?: string };
export type PdfTable = { headers: string[]; rows: string[][] };
export type PdfSection =
  | { type: "cards"; title: string; cards: PdfCard[] }
  | { type: "table"; title: string; table: PdfTable }
  | { type: "kv"; title: string; rows: { label: string; value: string; bold?: boolean; color?: "red" | "green" }[] };

export type PdfReportData = {
  title: string;
  subtitle?: string;
  date: string;
  sections: PdfSection[];
};

const BRAND = "#0d9488";
const DARK = "#1a1a2e";
const GRAY = "#666666";

export function generateReport(data: PdfReportData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const marginL = 15;
  const marginR = 15;
  const contentW = pageW - marginL - marginR;
  let y = 15;

  function checkPage(need: number) {
    if (y + need > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 15;
    }
  }

  // Header bar
  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Rotina Clínica", marginL, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Relatório Financeiro", marginL, 18);
  doc.setFontSize(8);
  doc.text(data.date, pageW - marginR, 12, { align: "right" });

  y = 35;

  // Report title
  doc.setTextColor(26, 26, 46);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(data.title, marginL, y);
  y += 5;
  if (data.subtitle) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(data.subtitle, marginL, y);
    y += 4;
  }
  y += 6;

  for (const section of data.sections) {
    checkPage(25);

    // Section title
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(13, 148, 136);
    doc.text(section.title.toUpperCase(), marginL, y);
    y += 2;
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.5);
    doc.line(marginL, y, marginL + contentW, y);
    y += 6;

    if (section.type === "cards") {
      const cols = Math.min(section.cards.length, 3);
      const cardW = (contentW - (cols - 1) * 4) / cols;
      const cardH = 20;

      for (let i = 0; i < section.cards.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        if (col === 0 && row > 0) {
          y += cardH + 4;
          checkPage(cardH + 4);
        }
        const x = marginL + col * (cardW + 4);
        const cy = y;

        doc.setFillColor(245, 245, 250);
        doc.roundedRect(x, cy, cardW, cardH, 2, 2, "F");

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120, 120, 120);
        doc.text(section.cards[i].label, x + 3, cy + 5);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 26, 46);
        doc.text(section.cards[i].value, x + 3, cy + 12);

        if (section.cards[i].sub) {
          doc.setFontSize(6);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(140, 140, 140);
          doc.text(section.cards[i].sub!, x + 3, cy + 17);
        }
      }
      y += cardH + 8;
    }

    if (section.type === "table") {
      autoTable(doc, {
        startY: y,
        head: [section.table.headers],
        body: section.table.rows,
        margin: { left: marginL, right: marginR },
        styles: { fontSize: 8, cellPadding: 2.5, textColor: [40, 40, 40] },
        headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 248, 252] },
        theme: "grid",
        tableLineColor: [220, 220, 230],
        tableLineWidth: 0.2,
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
    }

    if (section.type === "kv") {
      for (const row of section.rows) {
        checkPage(7);
        doc.setFontSize(9);
        doc.setFont("helvetica", row.bold ? "bold" : "normal");
        doc.setTextColor(row.color === "red" ? 192 : row.color === "green" ? 10 : 40, row.color === "red" ? 57 : row.color === "green" ? 124 : 40, row.color === "red" ? 43 : row.color === "green" ? 66 : 40);
        doc.text(row.label, marginL + 2, y);
        doc.text(row.value, pageW - marginR - 2, y, { align: "right" });
        y += 5;
        if (row.bold) {
          doc.setDrawColor(230, 230, 230);
          doc.setLineWidth(0.2);
          doc.line(marginL, y - 2, pageW - marginR, y - 2);
        }
      }
      y += 6;
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const h = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 160);
    doc.text(`Rotina Clínica — ${data.date}`, marginL, h - 8);
    doc.text(`Página ${i} de ${pageCount}`, pageW - marginR, h - 8, { align: "right" });
  }

  doc.save(`relatorio-${data.title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
