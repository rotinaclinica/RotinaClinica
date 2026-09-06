# -*- coding: utf-8 -*-
"""Valida _topic_pages.json: cobertura de tokens do conteúdo existente
dentro da faixa de páginas mapeada. Baixa cobertura = mapeamento suspeito."""
import json
import re
import unicodedata
import fitz

PDF = "public/ebook/Guia de prescrições Rotina Clínica (1).pdf"
CONTENT = "lib/prescricoes-content.json"
MAP = "scripts/_topic_pages.json"

STOP = set("de da do das dos que com para uma um por em no na nas nos ao aos "
           "se ou como mais dose caso cada via apos ser sao pode entre sobre "
           "the and uso oral endovenoso intramuscular comprimido comprimidos".split())


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9 ]", " ", s)


def toks(s):
    return set(w for w in norm(s).split() if len(w) >= 5 and w not in STOP)


def page_text(page):
    return " ".join("".join(sp["text"] for sp in ln["spans"])
                    for b in page.get_text("dict")["blocks"] if b.get("type") == 0
                    for ln in b["lines"])


def main():
    content = json.load(open(CONTENT, encoding="utf-8"))
    mp = json.load(open(MAP, encoding="utf-8"))
    doc = fitz.open(PDF)
    page_tok = {}

    low = []
    print(f"{'id':>4} {'faixa':>10} {'cob%':>5} {'nº tokens':>9}")
    for tid in sorted(content.keys(), key=lambda x: int(x)):
        ct = toks(content[tid])
        pages = mp.get(tid, [])
        union = set()
        for p in pages:
            if p not in page_tok:
                page_tok[p] = toks(page_text(doc[p]))
            union |= page_tok[p]
        cov = len(ct & union) / max(1, len(ct))
        rng = f"{pages[0]}-{pages[-1]}" if pages else "VAZIO"
        mark = ""
        if cov < 0.75:
            mark = "  <<< BAIXA"
            low.append(tid)
        print(f"{tid:>4} {rng:>10} {cov*100:4.0f}% {len(ct):>9}{mark}")

    print(f"\nTemas com cobertura < 75%: {low}")
    print(f"Cobertura OK: {114 - len(low)}/114")


if __name__ == "__main__":
    main()
