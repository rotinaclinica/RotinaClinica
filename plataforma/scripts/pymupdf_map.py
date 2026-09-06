# -*- coding: utf-8 -*-
"""
Etapa 1 do pipeline: mapear cada página do PDF ao tema (id) correto,
por SOBREPOSIÇÃO DE CONTEÚDO com o prescricoes-content.json existente
(confiável para identificação, mesmo com bugs de formatação).

Imune a páginas de índice: elas não casam bem com nenhum conteúdo de tema.

Saída: scripts/_topic_pages.json  = { "<id>": [p0, p1, ...], ... }  (0-indexed)
E um relatório de validação no stdout.
"""
import json
import re
import unicodedata
import fitz
from collections import defaultdict

PDF = "public/ebook/Guia de prescrições Rotina Clínica (1).pdf"
CONTENT = "lib/prescricoes-content.json"
OUT = "scripts/_topic_pages.json"

STOP = set("de da do das dos que com para uma um por em no na nas nos ao aos "
           "se ou como mais dose caso cada via após ser são pode entre sobre "
           "the and uso oral endovenoso intramuscular comprimido comprimidos".split())


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9 ]", " ", s)


def tokens(s):
    return set(w for w in norm(s).split() if len(w) >= 5 and w not in STOP)


def page_text(page):
    return " ".join(
        "".join(sp["text"] for sp in ln["spans"])
        for b in page.get_text("dict")["blocks"] if b.get("type") == 0
        for ln in b["lines"]
    )


def main():
    content = json.load(open(CONTENT, encoding="utf-8"))
    topic_tokens = {tid: tokens(txt) for tid, txt in content.items()}
    ids_ordered = sorted(content.keys(), key=lambda x: int(x))

    doc = fitz.open(PDF)
    n = len(doc)
    page_tok = []
    for p in range(n):
        page_tok.append(tokens(page_text(doc[p])))

    # score cada página contra cada tema
    page_best = []  # (page, best_id, score, coverage)
    for p in range(n):
        pt = page_tok[p]
        if len(pt) < 4:
            page_best.append((p, None, 0, 0.0))
            continue
        best_id, best_score = None, 0
        for tid, tt in topic_tokens.items():
            inter = len(pt & tt)
            if inter > best_score:
                best_score, best_id = inter, tid
        cov = best_score / max(1, len(pt))
        page_best.append((p, best_id, best_score, cov))

    # aceita atribuição só se cobertura razoável (evita índice/divisórias)
    assign = {}
    for p, bid, sc, cov in page_best:
        if bid is not None and (cov >= 0.45 or sc >= 8):
            assign[p] = bid

    topic_pages = defaultdict(list)
    for p in sorted(assign):
        topic_pages[assign[p]].append(p)

    # relatório
    covered = sorted(topic_pages.keys(), key=lambda x: int(x))
    missing = [tid for tid in ids_ordered if tid not in topic_pages]
    print(f"Páginas totais: {n}")
    print(f"Temas com páginas atribuídas: {len(covered)}/{len(ids_ordered)}")
    print(f"Temas SEM páginas: {missing}\n")

    # checa contiguidade (páginas de um tema devem ser ~consecutivas)
    print("=== Faixas por tema (id: páginas) ===")
    noncontig = []
    for tid in covered:
        ps = topic_pages[tid]
        gaps = [(a, b) for a, b in zip(ps, ps[1:]) if b - a > 1]
        flag = "  <<< NÃO-CONTÍGUO" if gaps else ""
        if gaps:
            noncontig.append(tid)
        print(f"  {tid:>3}: {ps[0]}-{ps[-1]} ({len(ps)}p){flag}")

    print(f"\nNão-contíguos: {noncontig}")
    json.dump({tid: topic_pages[tid] for tid in covered}, open(OUT, "w"), indent=0)
    print(f"\nSalvo: {OUT}")


if __name__ == "__main__":
    main()
