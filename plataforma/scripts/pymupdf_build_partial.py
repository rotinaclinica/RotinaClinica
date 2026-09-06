# -*- coding: utf-8 -*-
"""
Option A-parcial: re-extrai LIMPO só os temas que mapeiam 1:1 a um capítulo
do ebook (heading y=121), com TRAVA DE VALIDAÇÃO — só substitui se a extração
nova tiver alta sobreposição de tokens com o conteúdo antigo (mesmo tema).
Temas irregulares/ambíguos mantêm o conteúdo atual.

Saída:
  lib/prescricoes-content.NEW.json   (conteúdo final mesclado)
  scripts/_rebuild_report.txt        (o que foi re-extraído vs mantido)
"""
import json
import re
import unicodedata
import fitz

PDF = "public/ebook/Guia de prescrições Rotina Clínica (1).pdf"
CONTENT = "lib/prescricoes-content.json"          # atual (bom, com fixes manuais)
META = "lib/prescricoes-meta.ts"
OUT = "lib/prescricoes-content.NEW.json"
REPORT = "scripts/_rebuild_report.txt"

OVERLAP_MIN = 0.55   # trava: fração dos tokens do tema (antigo) presentes no novo

# ── classificação por fonte (igual pymupdf_extract) ──────────────────────────
RX_SECTION = re.compile(
    r"^(Uso\s+(oral|endovenoso|intravenoso|intramuscular|inalat[óo]rio|t[óo]pico|"
    r"subcut[âa]neo|ocular|retal|nasal|sublingual|vaginal|intravaginal)|"
    r"Cuidados gerais|Orienta[çc]|Sintom[áa]ticos|Crit[ée]rios|Preparo|Manejo|"
    r"Medidas|Profilaxia|Posologia|Escolha do|Recomenda[çc])", re.I)
RX_DOSE = re.compile(r"\d[\d.,]*\s?(mg|mcg|µg|ml|g\b|kg|ui|mmol|meq|%)", re.I)
RX_FORM = re.compile(r"\b(F/A|ampola|comprimido|c[áa]psula|frasco|sach[êe]|"
                     r"supositório|pomada|col[íi]rio|creme|gel|spray|inalador|bolsa|"
                     r"solu[çc][ãa]o|suspens[ãa]o|xarope|gota|dr[áa]gea|adesivo|"
                     r"[óo]vulo|UI/|injet[áa]vel)\b", re.I)
HEADER_Y = 210


def visual_lines(page):
    fills = []
    for d in page.get_drawings():
        r = d.get("rect")
        if r is not None and d.get("fill") is not None and r.width * r.height < 200000:
            fills.append(r)

    def has_bg(x, y):
        return any(r.x0 - 1 <= x <= r.x1 + 1 and r.y0 - 1 <= y <= r.y1 + 1 for r in fills)

    spans = []
    for b in page.get_text("dict")["blocks"]:
        if b.get("type") != 0:
            continue
        for ln in b["lines"]:
            for s in ln["spans"]:
                if s["text"].strip():
                    spans.append({"text": s["text"], "x": s["bbox"][0], "y": s["bbox"][1],
                                  "font": s["font"], "size": s["size"]})
    spans.sort(key=lambda s: (round(s["y"] / 3), s["x"]))
    lines, cur = [], None
    for s in spans:
        if cur is None or abs(s["y"] - cur["y"]) > 3:
            cur = {"y": s["y"], "x": s["x"], "spans": [s]}
            lines.append(cur)
        else:
            cur["spans"].append(s)
    out = []
    for L in lines:
        sp = L["spans"]
        text = re.sub(r"\s+", " ", " ".join(x["text"].strip() for x in sp)).strip()
        if not text:
            continue
        s0 = sp[0]
        allbold = all(any(k in x["font"].lower() for k in ("bold", "black", "semibold")) for x in sp)
        extrabold = any("extrabold" in x["font"].lower() for x in sp)
        bg = has_bg((s0["x"] + sp[-1]["x"]) / 2, s0["y"])
        out.append({"text": text, "x": L["x"], "y": L["y"], "size": s0["size"],
                    "allbold": allbold, "extrabold": extrabold, "bg": bg})
    return out


def is_bold_note(t):
    return t.startswith(("→", "*", "•")) or (t.endswith(".") and len(t.split()) > 7)


def classify(ln):
    if ln["extrabold"] or ln["bg"]:
        return "BANNER"
    if len(ln["text"]) < 40 and RX_SECTION.match(ln["text"]):
        return "SECTION"
    if ln["allbold"] and ln["size"] >= 17:
        return "SECTION"
    if ln["allbold"] and is_bold_note(ln["text"]):
        return "INSTR"
    if ln["allbold"] and (RX_DOSE.search(ln["text"]) or RX_FORM.search(ln["text"])):
        return "DRUG"
    if ln["allbold"] and len(ln["text"].split()) <= 6 and not ln["text"].endswith("."):
        return "SUBHEAD"
    return "INSTR"


def unbalanced(s):
    return s.count("(") > s.count(")")


def extract_topic(doc, pages):
    raw, header_seen = [], set()
    for p in pages:
        for ln in visual_lines(doc[p]):
            if ln["y"] < HEADER_Y:
                key = re.sub(r"\s+", " ", ln["text"].lower())
                if key in header_seen:
                    continue
                header_seen.add(key)
            raw.append(ln)
    out, sections_seen = [], set()
    i, n = 0, len(raw)
    while i < n:
        ln = raw[i]; k = classify(ln); t = ln["text"]
        if k == "BANNER":
            i += 1; continue
        if k in ("SECTION", "SUBHEAD"):
            key = re.sub(r"\s+", " ", t.lower())
            if key not in sections_seen:
                out.append(("SECTION", t)); sections_seen.add(key)
            i += 1; continue
        if k == "DRUG":
            name = t
            while i + 1 < n:
                nx = raw[i + 1]; nxt = nx["text"]
                if unbalanced(name) or name.rstrip().endswith("-"):
                    name += " " + nxt; i += 1; continue
                if nxt[:1] == "(" or re.match(r"^[a-záàâãéêíóôõúç]", nxt):
                    if classify(nx) != "SECTION":
                        name += " " + nxt; i += 1; continue
                break
            name = re.sub(r"\s*-\s*Bolsa\s*$", "", name)  # remove sufixo de recipiente
            out.append(("DRUG", name)); i += 1; continue
        txt = t
        while i + 1 < n and classify(raw[i + 1]) == "INSTR":
            txt += " " + raw[i + 1]["text"]; i += 1
        out.append(("INSTR", txt)); i += 1
    lines = []
    for kind, text in out:
        if kind == "SECTION" and lines:
            lines.append("")
        lines.append(text)
    return "\n".join(lines).strip()


# ── tokens/normalização ──────────────────────────────────────────────────────
STOP = set("de da do das dos que com para uma um por em no na nas nos ao aos se ou "
           "como mais dose caso cada via apos ser sao pode entre sobre the and uso "
           "oral endovenoso intramuscular comprimido comprimidos".split())


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9 ]", " ", s)


def toks(s):
    return set(w for w in norm(s).split() if len(w) >= 5 and w not in STOP)


def page_heading(page):
    for b in page.get_text("dict")["blocks"]:
        if b.get("type") != 0:
            continue
        for ln in b["lines"]:
            sp = ln["spans"]; t = "".join(s["text"] for s in sp).strip()
            if sp and t and sp[0]["size"] >= 17 and round(ln["bbox"][1]) < 135:
                return t
    return None


def main():
    content = json.load(open(CONTENT, encoding="utf-8"))
    ts = open(META, encoding="utf-8").read()
    titles = [(m.group(1), m.group(2)) for m in
              re.finditer(r'"id": "(\d+)",\s*"titulo": "([^"]+)"', ts)]

    doc = fitz.open(PDF)
    heads = [page_heading(doc[p]) for p in range(len(doc))]
    heads_norm = [norm(h) if h else "" for h in heads]

    result = dict(content)  # começa com o atual; só sobrescreve os aprovados
    report = []
    reextracted = 0
    claimed = {}  # página -> tid que já a reivindicou
    for tid, title in titles:
        nt = norm(title).strip()
        # páginas cujo heading y=121 casa com o título (exato ou prefixo);
        # colisões são resolvidas pela guarda de duplicata + trava de cobertura
        pages = [p for p in range(len(doc))
                 if heads_norm[p] and (nt == heads_norm[p].strip()
                                       or heads_norm[p].strip().startswith(nt + " ")
                                       or nt.startswith(heads_norm[p].strip() + " "))]
        if not pages:
            report.append(f"[{tid:>3}] MANTIDO (sem heading próprio)  {title}")
            continue
        # exige contiguidade
        if pages[-1] - pages[0] + 1 != len(pages):
            report.append(f"[{tid:>3}] MANTIDO (páginas não-contíguas {pages})  {title}")
            continue
        # guarda contra páginas já reivindicadas por outro tema
        dup = [p for p in pages if p in claimed]
        if dup:
            report.append(f"[{tid:>3}] MANTIDO (páginas já usadas pelo tema {claimed[dup[0]]})  {title}")
            continue
        new_txt = extract_topic(doc, pages)
        # trava de validação: sobreposição com o conteúdo antigo
        old_tok = toks(content[tid]); new_tok = toks(new_txt)
        cov = len(old_tok & new_tok) / max(1, len(old_tok))
        if cov >= OVERLAP_MIN and len(new_txt) > 40:
            result[tid] = new_txt
            reextracted += 1
            for p in pages:
                claimed[p] = tid
            report.append(f"[{tid:>3}] RE-EXTRAÍDO  p{pages[0]}-{pages[-1]} cov={cov*100:.0f}%  {title}")
        else:
            report.append(f"[{tid:>3}] MANTIDO (cov baixa {cov*100:.0f}%)  {title}")

    json.dump(result, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(REPORT, "w", encoding="utf-8").write("\n".join(report))
    print(f"Re-extraídos: {reextracted}/114 | Mantidos: {114 - reextracted}")
    print(f"Saída: {OUT}\nRelatório: {REPORT}")


if __name__ == "__main__":
    main()
