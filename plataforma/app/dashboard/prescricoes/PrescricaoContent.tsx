"use client";

// ── Classifiers ──────────────────────────────────────────────────────────────

const RX_DOSE = /\d[\d.,]*\s?(mg|mcg|µg|ml|ml\b|g\b|kg|ui|mmol|meq|%)/i;
const RX_FORM = /\b(F\/A|ampola|comprimido|c[áa]psula|frasco|sach[êe]|supositório|pomada|colírio|creme|gel|spray|inalador|bolsa|solução|suspensão|xarope|gotas?|dr[áa]gea|adesivo|óvulo)\b/i;

// Lines that start with these patterns are NOT drugs even if they have a dose
const NOT_DRUG = /^(Calcular|Calcule|Exemplo|Verificar|Observar|Atentar|Considerar|Avaliar|Reavaliar|Total |Volume |Dose |Se |Em caso|Na ausência|Para |Diante|Caso |Quando |Conforme|Portanto|Assim |Logo |Pois |Além |Nota |Obs |O2 >|SpO2|Sat\.|SF |SG |RL |NaCl|KCl|Na\s*[<>]|K\s*[<>]|Mg\s*[<>]|pH\s*[<>]|[<>]\s*\d|\d+\s*(mL|ml)\s+de\s|\d+\s*%|Solução final|Sugestão|BIC\b)/i;

// Instruction-verb regex used both in isInstruction and tryExtractDrug
const RX_INSTR_VERB = /\b(Tomar|Aplic\w*|Administr\w*|Diluir|Dilua|Utilizar|Utilize|Infund\w*|Reconstitu\w*|Fazer|Faça|Dar\b|Dê\b|Usar\b|Use\b|Ingerir|Ingira|Pingar|Instilar|Repet\w*|Manter\b|Mantenha|Prescrev\w*|Realiz\w*|Colocar|Injetar|Deixar|Adicionar|Iniciar|Inicie|Ministrar|Nebuliz\w*|Borrifar|Passar|Inalar)\b/i;

const isSection = (l: string) =>
  /^(Uso\s+(oral|endovenoso|intravenoso|intramuscular|inalatório|tópico|subcutâneo|ocular|retal|nasal|sublingual|vaginal|intravaginal)|Cuidados gerais|Orientaç|Sintom[áa]ticos|Tratamento\b|Critérios|Preparo|Manejo|Medidas|Profilaxia|Posologia|Escolha do|Recomendaç)/i.test(l.trim());

const isConnector = (l: string) =>
  /^(Ou|E\/Ou|Associado a[:.]?|Alternativa[:.]?|\+)\s*$/i.test(l.trim());

const isNoteHeader = (l: string) =>
  /^(Detalhes?|Obs|Observaç\w*|Nota|Aten[çc]\w*|Importante|Racional|B[ôo]nus|Sugestão)\b[:.]?/i.test(l.trim());

const isInstruction = (l: string) => RX_INSTR_VERB.test(l.trim().slice(0, 15));

const isDrug = (l: string) => {
  const t = l.trim();
  if (t.length > 95) return false;
  // Numbered step "1) Texto sem ----" → instruction/text, not drug.
  // But "1) Medicamento ---- dose" → drug (has separator).
  if (/^\d+\)/.test(t) && !/-{4,}/.test(t)) return false;
  if (NOT_DRUG.test(t)) return false;
  if (/^[a-záàâãéêíóôõúç]/.test(t)) return false;
  return RX_DOSE.test(t) || RX_FORM.test(t);
};

// Splits a long line that merges a drug name + instruction into one string.
// Returns { drug, instr } or null.
function tryExtractDrug(t: string): { drug: string; instr: string } | null {
  if (t.length <= 95) return null;
  // Numbered step without ---- separator is an instruction, not a drug
  if (/^\d+\)/.test(t) && !/-{4,}/.test(t)) return null;
  if (NOT_DRUG.test(t)) return null;
  if (/^[a-záàâãéêíóôõúç]/.test(t)) return null;
  // Find first instruction verb that isn't at position 0
  const m = new RegExp("\\s(" + RX_INSTR_VERB.source + ")", "i").exec(t);
  if (!m || m.index < 5) return null;
  const drugPart = t.slice(0, m.index).trim();
  const instrPart = t.slice(m.index).trim();
  if (drugPart.length > 95) return null;
  if (NOT_DRUG.test(drugPart)) return null;
  if (/^[a-záàâãéêíóôõúç]/.test(drugPart)) return null;
  if (RX_DOSE.test(drugPart) || RX_FORM.test(drugPart)) {
    return { drug: drugPart, instr: instrPart };
  }
  return null;
}

const isSubtitle = (l: string) => {
  const t = l.trim();
  return (t.endsWith(":") && t.length < 70) || (/^[A-ZÁÀÂÃÉÍÓÔÕÚÇ0-9 ]{4,45}$/.test(t) && t.split(" ").length <= 6);
};

const isImageMarker = (l: string) => /^\[IMAGE:[^\]]+\]$/.test(l.trim());

const isNewUnit = (t: string) =>
  isConnector(t) || isSection(t) || isNoteHeader(t) || isInstruction(t) || isDrug(t) || isSubtitle(t) || isImageMarker(t);

const isHeader = (t: string) =>
  isConnector(t) || isSection(t) || isNoteHeader(t) || isSubtitle(t);

// ── Block model ──────────────────────────────────────────────────────────────

type Block =
  | { type: "section"; text: string }
  | { type: "connector"; text: string }
  | { type: "drug"; name: string; qty: string; instructions: string[] }
  | { type: "note"; body: string[] }
  | { type: "subtitle"; text: string }
  | { type: "text"; text: string }
  | { type: "image"; src: string };

function parse(content: string): Block[] {
  // 1) Re-join wrapped lines into logical lines.
  const logical: string[] = [];
  let lastWasHeader = false;
  for (const para of content.split(/\n\n+/)) {
    for (const raw of para.split("\n")) {
      const t = raw.trim();
      if (!t) continue;
      if (logical.length === 0 || isNewUnit(t) || lastWasHeader || logical[logical.length - 1] === "\x00") {
        logical.push(t);
      } else {
        logical[logical.length - 1] += " " + t;
      }
      lastWasHeader = isHeader(t);
    }
    logical.push("\x00"); // paragraph break marker
    lastWasHeader = false;
  }

  // 2) Classify logical lines into blocks.
  const blocks: Block[] = [];
  let curDrug: Extract<Block, { type: "drug" }> | null = null;
  let curNote: Extract<Block, { type: "note" }> | null = null;

  for (const line of logical) {
    if (line === "\x00") { continue; }
    const t = line.trim();
    if (!t) continue;

    if (isImageMarker(t)) {
      curDrug = null; curNote = null;
      const src = t.slice(7, -1); // strip [IMAGE: and ]
      blocks.push({ type: "image", src });
    } else if (isConnector(t)) {
      curDrug = null; curNote = null;
      blocks.push({ type: "connector", text: t.replace(/[:.]$/, "") });
    } else if (isSection(t)) {
      curDrug = null; curNote = null;
      blocks.push({ type: "section", text: t.replace(/:$/, "") });
    } else if (isNoteHeader(t)) {
      curDrug = null;
      const rest = t.replace(/^(Detalhes?|Obs\w*|Observaç\w*|Nota|Aten[çc]\w*|Importante|Racional|B[ôo]nus|Sugestão)\b[:.]?\s*/i, "").trim();
      curNote = { type: "note", body: rest ? [rest] : [] };
      blocks.push(curNote);
    } else if (isInstruction(t)) {
      if (curDrug) curDrug.instructions.push(t);
      else if (curNote) curNote.body.push(t);
      else blocks.push({ type: "text", text: t });
    } else {
      // Check for long merged drug+instruction line before isDrug (which rejects > 95 chars)
      const extracted = tryExtractDrug(t);
      if (extracted) {
        curNote = null;
        const [name, qty] = extracted.drug.split(/\s*-{4,}\s*/);
        curDrug = { type: "drug", name: name.trim(), qty: (qty ?? "").trim(), instructions: [extracted.instr] };
        blocks.push(curDrug);
      } else if (isDrug(t)) {
        curNote = null;
        const [name, qty] = t.split(/\s*-{4,}\s*/);
        // Strip leading "1) " step prefix from drug name
        const cleanName = name.trim().replace(/^\d+\)\s*/, "");
        curDrug = { type: "drug", name: cleanName, qty: (qty ?? "").trim(), instructions: [] };
        blocks.push(curDrug);
      } else if (curNote) {
        curNote.body.push(t);
      } else if (isSubtitle(t)) {
        curDrug = null;
        blocks.push({ type: "subtitle", text: t.replace(/:$/, "") });
      } else {
        curDrug = null;
        blocks.push({ type: "text", text: t });
      }
    }
  }

  // 3) Merge consecutive text blocks — fixes PDF paragraph-break artifacts.
  //    Two text blocks merge if neither begins a new structural thought
  //    (i.e., the first doesn't end with "." followed by a capital-letter new sentence).
  const merged: Block[] = [];
  for (const blk of blocks) {
    const prev = merged[merged.length - 1];
    if (
      blk.type === "text" &&
      prev?.type === "text" &&
      // Don't merge if the previous block clearly ends a paragraph
      // (ends with period + looks like a complete sentence and next starts with capital after a noun)
      !/[!?]$/.test(prev.text)
    ) {
      prev.text += " " + blk.text;
    } else {
      merged.push(blk);
    }
  }

  return merged;
}

// ── Renderer ─────────────────────────────────────────────────────────────────

export default function PrescricaoContent({ conteudo }: { conteudo: string }) {
  const blocks = parse(conteudo);

  return (
    <div className="space-y-2.5">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "section":
            return (
              <p key={i} className="text-[13px] font-extrabold text-[#0f2d4a] uppercase tracking-wider pt-3 first:pt-0">
                {b.text}
              </p>
            );

          case "drug":
            return (
              <div key={i} className="my-0.5">
                <div className="inline-flex items-baseline gap-2 border border-[#1a6aad]/35 bg-[#f0f7ff] rounded-lg px-3 py-1.5">
                  <span className="text-[14px] font-bold text-[#0f2d4a] leading-snug">{b.name}</span>
                  {b.qty && (
                    <span className="text-[13px] font-semibold text-[#1a6aad] whitespace-nowrap">{b.qty}</span>
                  )}
                </div>
                {b.instructions.length > 0 && (
                  <div className="mt-1.5 pl-3 border-l-2 border-[#1a6aad]/20 space-y-1">
                    {b.instructions
                      .reduce<string[]>((acc, ins) => {
                        const prev = acc[acc.length - 1];
                        if (prev && !/[.!?]$/.test(prev.trimEnd())) {
                          acc[acc.length - 1] = prev + " " + ins;
                        } else {
                          acc.push(ins);
                        }
                        return acc;
                      }, [])
                      .map((ins, k) => (
                        <p key={k} className="text-[13px] text-zinc-600 leading-relaxed text-justify">{ins}</p>
                      ))}
                  </div>
                )}
              </div>
            );

          case "connector":
            return (
              <div key={i} className="flex items-center gap-2 py-0.5">
                <div className="flex-1 h-px bg-zinc-200" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{b.text}</span>
                <div className="flex-1 h-px bg-zinc-200" />
              </div>
            );

          case "note":
            return (
              <div key={i} className="border-l-[3px] border-[#3db8d4] bg-[#f8fbfd] rounded-r-lg pl-3.5 pr-3 py-2.5">
                <p className="text-[10px] font-bold text-[#1a6aad] uppercase tracking-wider mb-1">Detalhe</p>
                <div className="space-y-1">
                  {b.body.map((p, k) => (
                    <p key={k} className="text-[13px] text-zinc-600 leading-relaxed text-justify">{p}</p>
                  ))}
                </div>
              </div>
            );

          case "subtitle":
            return (
              <p key={i} className="text-xs font-bold text-zinc-500 uppercase tracking-wider pt-2">{b.text}</p>
            );

          case "text":
            return (
              <p key={i} className="text-sm text-zinc-600 leading-relaxed text-justify">{b.text}</p>
            );

          case "image":
            return (
              <div key={i} className="my-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.src}
                  alt=""
                  className="max-w-full rounded-lg border border-zinc-200 shadow-sm"
                  style={{ maxHeight: 420, objectFit: "contain" }}
                />
              </div>
            );
        }
      })}
    </div>
  );
}
