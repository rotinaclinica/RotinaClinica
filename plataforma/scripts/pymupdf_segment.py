# -*- coding: utf-8 -*-
"""
Etapa 1 (v2): segmentação por PROGRAMAÇÃO DINÂMICA.
Os 114 temas aparecem EM ORDEM no PDF. Particiona as páginas [P0,Pend) em
114 blocos contíguos e ordenados, maximizando a sobreposição de tokens
página↔conteúdo-existente. A restrição sequencial elimina a ganância.

Saída: scripts/_topic_pages.json = { "<id>": [p0..p1], ... } (0-indexed)
"""
import json
import re
import unicodedata
import fitz

PDF = "public/ebook/Guia de prescrições Rotina Clínica (1).pdf"
CONTENT = "lib/prescricoes-content.json"
OUT = "scripts/_topic_pages.json"

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
    return " ".join(
        "".join(sp["text"] for sp in ln["spans"])
        for b in page.get_text("dict")["blocks"] if b.get("type") == 0
        for ln in b["lines"]
    )


def main():
    content = json.load(open(CONTENT, encoding="utf-8"))
    ids = sorted(content.keys(), key=lambda x: int(x))
    T = len(ids)
    topic_tok = [toks(content[i]) for i in ids]

    doc = fitz.open(PDF)
    N = len(doc)
    page_tok = [toks(page_text(doc[p])) for p in range(N)]

    # matriz de match[p][t]
    def match(p, t):
        return len(page_tok[p] & topic_tok[t])

    # limita a região de conteúdo (ignora capa/índice iniciais e apêndice final)
    best_cov = []
    for p in range(N):
        pt = page_tok[p]
        if len(pt) < 4:
            best_cov.append(0.0); continue
        m = max((len(pt & topic_tok[t]) for t in range(T)), default=0)
        best_cov.append(m / len(pt))
    strong = [p for p in range(N) if best_cov[p] >= 0.5]
    P0, Pend = strong[0], strong[-1] + 1
    print(f"Região de conteúdo: páginas {P0}..{Pend-1} (de {N})")

    pages = list(range(P0, Pend))
    M = len(pages)
    # prefix sums de match por tema: pref[t][k] = sum match(pages[0..k-1], t)
    pref = [[0] * (M + 1) for _ in range(T)]
    for t in range(T):
        for k in range(M):
            pref[t][k + 1] = pref[t][k] + match(pages[k], t)

    def seg(t, a, b):  # soma match tema t sobre pages[a..b-1]
        return pref[t][b] - pref[t][a]

    NEG = -10 ** 9
    # dp[t][k] = melhor score atribuindo temas 0..t-1 às primeiras k páginas
    dp = [[NEG] * (M + 1) for _ in range(T + 1)]
    bk = [[-1] * (M + 1) for _ in range(T + 1)]
    dp[0][0] = 0
    for t in range(1, T + 1):
        # cada tema >=1 página; temas 0..t-1 ocupam >=t páginas
        for k in range(t, M - (T - t) + 1):
            best, arg = NEG, -1
            # fronteira anterior q em [t-1, k-1]
            for q in range(t - 1, k):
                if dp[t - 1][q] == NEG:
                    continue
                val = dp[t - 1][q] + seg(t - 1, q, k)
                if val > best:
                    best, arg = val, q
            dp[t][k] = best
            bk[t][k] = arg

    # reconstrói fronteiras
    bounds = [M]
    k = M
    for t in range(T, 0, -1):
        q = bk[t][k]
        bounds.append(q)
        k = q
    bounds.reverse()  # bounds[t]..bounds[t+1] = páginas do tema t

    topic_pages = {}
    for t in range(T):
        a, b = bounds[t], bounds[t + 1]
        topic_pages[ids[t]] = [pages[i] for i in range(a, b)]

    print("\n=== Faixas por tema ===")
    for t in range(T):
        ps = topic_pages[ids[t]]
        rng = f"{ps[0]}-{ps[-1]}" if ps else "VAZIO"
        # score de sanidade: cobertura média
        print(f"  {ids[t]:>3}: {rng} ({len(ps)}p)")

    json.dump(topic_pages, open(OUT, "w"), indent=0)
    print(f"\nSalvo: {OUT}")


if __name__ == "__main__":
    main()
