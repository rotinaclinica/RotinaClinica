# -*- coding: utf-8 -*-
"""Escaneia a hierarquia de headings do PDF para entender fronteiras de tema.
Lista, por página: banner (ExtraBold/fundo) e o maior heading Bold."""
import sys
import fitz

PDF = "public/ebook/Guia de prescrições Rotina Clínica (1).pdf"


def page_headings(page):
    fills = []
    for d in page.get_drawings():
        r = d.get("rect")
        if r is not None and d.get("fill") is not None and r.width * r.height < 200000:
            fills.append(r)

    def has_bg(bbox):
        cx, cy = (bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2
        return any(r.x0 - 1 <= cx <= r.x1 + 1 and r.y0 - 1 <= cy <= r.y1 + 1 for r in fills)

    banner = []
    biggest = []  # (size, text)
    for block in page.get_text("dict")["blocks"]:
        if block.get("type") != 0:
            continue
        for ln in block["lines"]:
            spans = ln["spans"]
            text = "".join(s["text"] for s in spans).strip()
            if not spans or not text:
                continue
            s0 = spans[0]
            f = s0["font"].lower()
            if "extrabold" in f or has_bg(ln["bbox"]):
                banner.append((round(s0["size"], 1), text, s0["bbox"][1] if "bbox" in s0 else ln["bbox"][1]))
            biggest.append((round(s0["size"], 1), text, f))
    biggest.sort(key=lambda t: -t[0])
    return banner, biggest[:3]


def main():
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 110
    end = int(sys.argv[2]) if len(sys.argv) > 2 else 130
    doc = fitz.open(PDF)
    for p in range(start, min(end, len(doc))):
        banner, big = page_headings(doc[p])
        btxt = " | ".join(f"{t}" for _, t, _ in banner) if banner else "—"
        bigtxt = " || ".join(f"{sz}:{t[:40]}" for sz, t, _ in big)
        print(f"p{p:3} banner=[{btxt[:40]}]  top3=[{bigtxt}]")


if __name__ == "__main__":
    main()
