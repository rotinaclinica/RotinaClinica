# -*- coding: utf-8 -*-
"""
Reconstrução layout-aware por FONTE + COORDENADA.

Regra descoberta no ebook (fonte Garet):
  - Garet-ExtraBold / fundo azul  -> TÍTULO da seção do capítulo
  - Garet-Bold  tamanho >= 17     -> SUBTÍTULO (ex: "Uso endovenoso", "Uso oral")
  - Garet-Bold  tamanho ~16       -> NOME de medicamento (CARD)
  - Garet-Regular                 -> INSTRUÇÃO / prosa (texto do card ou orientação)

Linhas Regular consecutivas sob um Bold pertencem àquele card (une o wrap).
Linhas Bold consecutivas = nome de medicamento quebrado em 2 linhas (une).
"""
import sys
import fitz

PDF = "public/ebook/Guia de prescrições Rotina Clínica (1).pdf"


def classify(font, size, has_bg):
    f = font.lower()
    if "extrabold" in f or has_bg:
        return "TITULO"
    bold = "bold" in f or "black" in f or "semibold" in f
    if bold and size >= 17:
        return "SUBTITULO"
    if bold:
        return "DRUG"
    return "INSTR"


def get_lines(page):
    # fundos coloridos (para detectar título)
    fills = []
    for d in page.get_drawings():
        r = d.get("rect")
        if r is not None and d.get("fill") is not None and r.width * r.height < 200000:
            fills.append(r)

    def has_bg(bbox):
        cx, cy = (bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2
        return any(r.x0 - 1 <= cx <= r.x1 + 1 and r.y0 - 1 <= cy <= r.y1 + 1 for r in fills)

    out = []
    for block in page.get_text("dict")["blocks"]:
        if block.get("type") != 0:
            continue
        for ln in block["lines"]:
            spans = ln["spans"]
            text = "".join(s["text"] for s in spans).strip()
            if not spans or not text:
                continue
            s0 = spans[0]
            kind = classify(s0["font"], s0["size"], has_bg(ln["bbox"]))
            out.append({"bbox": ln["bbox"], "text": text, "kind": kind, "x": ln["bbox"][0]})
    out.sort(key=lambda t: (round(t["bbox"][1] / 3), t["bbox"][0]))
    return out


def reconstruct(lines):
    """Agrupa em blocos estruturados unindo wraps por fonte."""
    blocks = []
    cur_drug = None
    i = 0
    while i < len(lines):
        ln = lines[i]
        k = ln["kind"]
        if k == "TITULO":
            blocks.append(("TITULO", ln["text"])); cur_drug = None
        elif k == "SUBTITULO":
            blocks.append(("SECAO", ln["text"])); cur_drug = None
        elif k == "DRUG":
            # une linhas DRUG consecutivas (nome quebrado)
            name = ln["text"]
            while i + 1 < len(lines) and lines[i + 1]["kind"] == "DRUG" and \
                    abs(lines[i + 1]["x"] - ln["x"]) < 4:
                i += 1
                name += " " + lines[i]["text"]
            cur_drug = {"name": name, "instr": []}
            blocks.append(("DRUG", cur_drug))
        else:  # INSTR
            # une linhas Regular consecutivas na mesma instrução
            txt = ln["text"]
            while i + 1 < len(lines) and lines[i + 1]["kind"] == "INSTR":
                nxt = lines[i + 1]["text"]
                i += 1
                txt += " " + nxt
            if cur_drug is not None:
                cur_drug["instr"].append(txt)
            else:
                blocks.append(("PROSA", txt))
        i += 1
    return blocks


def main():
    kw = sys.argv[1] if len(sys.argv) > 1 else "Ceftazidima"
    doc = fitz.open(PDF)
    pages = [i for i in range(len(doc)) if doc[i].search_for(kw)]
    p = pages[0]
    print(f"═══ Reconstrução layout-aware — página {p} (busca '{kw}') ═══\n")
    blocks = reconstruct(get_lines(doc[p]))
    for kind, payload in blocks:
        if kind == "TITULO":
            print(f"\n█ TÍTULO: {payload}")
        elif kind == "SECAO":
            print(f"\n▓ SEÇÃO: {payload}")
        elif kind == "PROSA":
            print(f"  ¶ {payload}")
        else:
            print(f"\n  ▌CARD: {payload['name']}")
            for ins in payload["instr"]:
                print(f"      └ {ins}")


if __name__ == "__main__":
    main()
