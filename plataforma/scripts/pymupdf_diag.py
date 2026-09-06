# -*- coding: utf-8 -*-
"""Diagnóstico: qual sinal (fonte/negrito/cor/fundo) distingue card de prosa."""
import sys
import fitz

PDF = "public/ebook/Guia de prescrições Rotina Clínica (1).pdf"


def main():
    kw = sys.argv[1] if len(sys.argv) > 1 else "Ceftazidima"
    doc = fitz.open(PDF)
    pages = find(doc, kw)
    p = pages[0]
    page = doc[p]
    print(f"Página {p}\n")

    # 1) TODAS as formas desenhadas (com cor de preenchimento e retângulo)
    print("=== DRAWINGS (formas desenhadas) ===")
    fills = []
    for d in page.get_drawings():
        r = d.get("rect")
        fill = d.get("fill")
        stroke = d.get("stroke")
        if r is None:
            continue
        if fill is not None:
            fills.append((r, fill))
        print(f"  rect=({r.x0:.0f},{r.y0:.0f},{r.x1:.0f},{r.y1:.0f}) "
              f"w={r.width:.0f} h={r.height:.0f} fill={fill} stroke={stroke}")

    # 2) Linhas com detalhe de fonte/negrito/cor + fundo detectado
    print("\n=== LINHAS (fonte / negrito / cor / fundo) ===")
    d = page.get_text("dict")
    rows = []
    for block in d["blocks"]:
        if block.get("type") != 0:
            continue
        for ln in block["lines"]:
            spans = ln["spans"]
            if not spans:
                continue
            text = "".join(s["text"] for s in spans).strip()
            if not text:
                continue
            s0 = spans[0]
            flags = s0["flags"]
            bold = bool(flags & (1 << 4)) or "bold" in s0["font"].lower() or "black" in s0["font"].lower() or "semibold" in s0["font"].lower()
            bbox = ln["bbox"]
            bg = bg_fill(bbox, fills)
            rows.append((bbox, text, s0["font"], round(s0["size"], 1), bold, s0["color"], bg))

    rows.sort(key=lambda t: (round(t[0][1] / 3), t[0][0]))
    for bbox, text, font, size, bold, color, bg in rows:
        b = "BOLD" if bold else "    "
        bgs = f"bg={bg}" if bg is not None else "bg=-"
        print(f"  [{b}] sz={size} col={color:#08x} {bgs:>14} | {font:22.22} | {text}")


def bg_fill(bbox, fills):
    cx = (bbox[0] + bbox[2]) / 2
    cy = (bbox[1] + bbox[3]) / 2
    for r, fill in fills:
        if r.x0 - 1 <= cx <= r.x1 + 1 and r.y0 - 1 <= cy <= r.y1 + 1:
            if r.width * r.height < 200000:  # não a página inteira
                return tuple(round(c, 2) for c in fill) if isinstance(fill, (list, tuple)) else fill
    return None


def find(doc, kw):
    return [i for i in range(len(doc)) if doc[i].search_for(kw)]


if __name__ == "__main__":
    main()
