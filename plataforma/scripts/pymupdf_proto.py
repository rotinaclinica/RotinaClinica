# -*- coding: utf-8 -*-
"""
Protótipo de extração layout-aware com PyMuPDF.

Objetivo: mostrar que, cruzando (a) blocos de texto com bounding box e
(b) retângulos desenhados na página (as "caixas" dos cards do ebook),
conseguimos classificar automaticamente:
  - CARD  = texto que está DENTRO de uma caixa desenhada
  - PROSA = texto FORA de qualquer caixa (seções, orientações, explicações)

Uso:
  python scripts/pymupdf_proto.py "<palavra-chave para localizar a página>"
"""
import sys
import fitz  # PyMuPDF

PDF = "public/ebook/Guia de prescrições Rotina Clínica (1).pdf"


def find_pages(doc, keyword):
    hits = []
    for i in range(len(doc)):
        if doc[i].search_for(keyword):
            hits.append(i)
    return hits


def rect_area(r):
    return max(0.0, r.width) * max(0.0, r.height)


def collect_boxes(page):
    """Retângulos desenhados que parecem 'caixas de card' (borda, não gigantes)."""
    boxes = []
    for d in page.get_drawings():
        r = d.get("rect")
        if r is None:
            continue
        # caixas de card: largura razoável, altura baixa, não a página inteira
        if r.width < 40 or r.height < 8:
            continue
        if rect_area(r) > 0.6 * (page.rect.width * page.rect.height):
            continue
        # precisa ter traço/preenchimento (borda visível)
        if not (d.get("stroke") or d.get("fill")):
            continue
        boxes.append(r)
    return boxes


def line_in_any_box(bbox, boxes):
    cx = (bbox[0] + bbox[2]) / 2
    cy = (bbox[1] + bbox[3]) / 2
    for r in boxes:
        if r.x0 - 2 <= cx <= r.x1 + 2 and r.y0 - 2 <= cy <= r.y1 + 2:
            return r
    return None


def analyze(page):
    boxes = collect_boxes(page)
    d = page.get_text("dict")
    print(f"  página tem {len(boxes)} caixa(s) desenhada(s) candidata(s) a card\n")

    # blocos -> linhas, na ordem de leitura (top->bottom, left->right)
    lines = []
    for block in d["blocks"]:
        if block.get("type") != 0:
            continue
        for ln in block["lines"]:
            text = "".join(span["text"] for span in ln["spans"]).strip()
            if not text:
                continue
            bbox = ln["bbox"]
            lines.append((bbox, text))
    lines.sort(key=lambda t: (round(t[0][1] / 3), t[0][0]))

    for bbox, text in lines:
        box = line_in_any_box(bbox, boxes)
        tag = "CARD " if box else "prosa"
        print(f"  [{tag}] {text}")


def main():
    kw = sys.argv[1] if len(sys.argv) > 1 else "Ceftazidima"
    doc = fitz.open(PDF)
    print(f"PDF: {len(doc)} páginas. Buscando '{kw}'...")
    pages = find_pages(doc, kw)
    if not pages:
        print("Não encontrado.")
        return
    print(f"Encontrado nas páginas (0-idx): {pages}\n")
    p = pages[0]
    print(f"━━━━━ ANÁLISE DA PÁGINA {p} ━━━━━")
    analyze(doc[p])


if __name__ == "__main__":
    main()
