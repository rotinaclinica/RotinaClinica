# -*- coding: utf-8 -*-
"""
Etapa 2 (v2): extração LIMPA por fonte -> texto achatado (formato atual).

Refinamentos:
  - REAGRUPA spans por Y (texto justificado vira 1 linha visual)
  - classifica a LINHA VISUAL inteira (spans mistos Bold+Regular = prosa)
  - CARD só se a linha for toda-negrito E tiver dose/forma (evita ênfase inline)
  - DEDUP da zona de cabeçalho (y no topo) -> banner/título/definição 1x por tema
  - une wraps (Regular consecutivos = 1 instrução; parêntese aberto continua nome)

Saída: lib/prescricoes-content.NEW.json
"""
import json
import re
import fitz

PDF = "public/ebook/Guia de prescrições Rotina Clínica (1).pdf"
MAP = "scripts/_topic_pages.json"
OUT = "lib/prescricoes-content.NEW.json"

HEADER_Y = 210  # acima disso = zona de cabeçalho corrido (banner/título/definição)

# Seção por TEXTO (independe da fonte — espelha o parser do app)
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


def visual_lines(page):
    """Reagrupa spans por Y em linhas visuais; retorna dicts ordenados."""
    fills = []
    for d in page.get_drawings():
        r = d.get("rect")
        if r is not None and d.get("fill") is not None and r.width * r.height < 200000:
            fills.append(r)

    def has_bg(x, y):
        return any(r.x0 - 1 <= x <= r.x1 + 1 and r.y0 - 1 <= y <= r.y1 + 1 for r in fills)

    # coleta todos os spans
    spans = []
    for b in page.get_text("dict")["blocks"]:
        if b.get("type") != 0:
            continue
        for ln in b["lines"]:
            for s in ln["spans"]:
                t = s["text"]
                if not t.strip():
                    continue
                spans.append({
                    "text": t, "x": s["bbox"][0], "y": s["bbox"][1],
                    "font": s["font"], "size": s["size"],
                })
    # agrupa por Y (tolerância 3px)
    spans.sort(key=lambda s: (round(s["y"] / 3), s["x"]))
    lines = []
    cur = None
    for s in spans:
        if cur is None or abs(s["y"] - cur["y"]) > 3:
            cur = {"y": s["y"], "x": s["x"], "spans": [s]}
            lines.append(cur)
        else:
            cur["spans"].append(s)

    out = []
    for L in lines:
        sp = L["spans"]
        text = " ".join(x["text"].strip() for x in sp).strip()
        text = re.sub(r"\s+", " ", text)
        if not text:
            continue
        s0 = sp[0]
        allbold = all(("bold" in x["font"].lower() or "black" in x["font"].lower()
                       or "semibold" in x["font"].lower()) for x in sp)
        extrabold = any("extrabold" in x["font"].lower() for x in sp)
        bg = has_bg((s0["x"] + sp[-1]["x"]) / 2, s0["y"])
        out.append({"text": text, "x": L["x"], "y": L["y"], "size": s0["size"],
                    "allbold": allbold, "extrabold": extrabold, "bg": bg})
    return out


def is_bold_note(text):
    """Negrito que é nota/frase, não nome de card."""
    if text.startswith(("→", "*", "•")):
        return True
    words = text.split()
    if text.endswith(".") and len(words) > 7:
        return True
    return False


def classify(ln):
    if ln["extrabold"] or ln["bg"]:
        return "BANNER"
    # seção por texto (curta) — pega "Uso endovenoso:" mesmo em fonte Regular
    if len(ln["text"]) < 40 and RX_SECTION.match(ln["text"]):
        return "SECTION"
    if ln["allbold"] and ln["size"] >= 17:
        return "SECTION"
    if ln["allbold"] and is_bold_note(ln["text"]):
        return "INSTR"
    if ln["allbold"] and (RX_DOSE.search(ln["text"]) or RX_FORM.search(ln["text"])):
        return "DRUG"
    if ln["allbold"] and len(ln["text"].split()) <= 6 and not ln["text"].endswith("."):
        return "SUBHEAD"  # subtítulo em negrito sem dose (ex: "Hipercalcemia grave/sintomática")
    return "INSTR"


def unbalanced(s):
    return s.count("(") > s.count(")")


def extract_topic(doc, pages):
    raw = []
    header_seen = set()
    for idx, p in enumerate(pages):
        for ln in visual_lines(doc[p]):
            # zona de cabeçalho: emite só na 1ª vez que o texto aparece
            if ln["y"] < HEADER_Y:
                key = re.sub(r"\s+", " ", ln["text"].lower())
                if key in header_seen:
                    continue
                header_seen.add(key)
            raw.append(ln)

    out = []
    sections_seen = set()  # dedup global de headings corridos por tema
    i, n = 0, len(raw)
    while i < n:
        ln = raw[i]
        k = classify(ln)
        t = ln["text"]

        if k == "BANNER":
            i += 1
            continue
        if k in ("SECTION", "SUBHEAD"):
            key = re.sub(r"\s+", " ", t.lower())
            if key not in sections_seen:
                out.append(("SECTION", t))
                sections_seen.add(key)
            i += 1
            continue
        if k == "DRUG":
            name = t
            while i + 1 < n:
                nx = raw[i + 1]
                nxt = nx["text"]
                # continua o nome só se: parêntese aberto pendente, OU a próxima
                # linha começa com "(" (parêntese) ou minúscula (palavra quebrada).
                if unbalanced(name) or name.rstrip().endswith("-"):
                    name += " " + nxt; i += 1; continue
                if nxt[:1] == "(" or re.match(r"^[a-záàâãéêíóôõúç]", nxt):
                    if classify(nx) != "SECTION":
                        name += " " + nxt; i += 1; continue
                break
            out.append(("DRUG", name)); last_section = None
            i += 1
            continue
        # INSTR
        txt = t
        while i + 1 < n and classify(raw[i + 1]) == "INSTR":
            txt += " " + raw[i + 1]["text"]; i += 1
        out.append(("INSTR", txt))
        i += 1

    lines = []
    for kind, text in out:
        if kind == "SECTION" and lines:
            lines.append("")
        lines.append(text)
    return "\n".join(lines).strip()


def main():
    mp = json.load(open(MAP, encoding="utf-8"))
    doc = fitz.open(PDF)
    result = {tid: extract_topic(doc, mp[tid]) for tid in sorted(mp, key=lambda x: int(x))}
    json.dump(result, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"Salvo: {OUT} ({len(result)} temas)")


if __name__ == "__main__":
    main()
