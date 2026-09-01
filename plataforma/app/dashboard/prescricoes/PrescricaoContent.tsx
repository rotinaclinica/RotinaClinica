"use client";

// ── Classifiers ──────────────────────────────────────────────────────────────

const RX_DOSE = /\d[\d.,]*\s?(mg|mcg|µg|ml|ml\b|g\b|kg|ui|mmol|meq|%)/i;
const RX_FORM = /\b(F\/A|ampola|comprimido|c[áa]psula|frasco|sach[êe]|supositório|pomada|colírio|creme|gel|spray|inalador|bolsa|solução|suspensão|xarope|gotas?|dr[áa]gea|adesivo|óvulo|lo[çc][ãa]o)\b/i;

// Lines that start with these patterns are NOT drugs even if they have a dose
const NOT_DRUG = /^(Calcular|Calcule|Exemplo|Verificar|Observar|Atentar|Considerar|Avaliar|Reavaliar|Total |Volume |Doses? |Se |Em caso|Na ausência|Para |Diante|Caso |Quando |Conforme|Portanto|Assim |Logo |Pois |Além |Nota |Obs |O2 >|SpO2|Sat\.|SF |SG |RL |NaCl|KCl|Na\s*[<>]|K\s*[<>]|Mg\s*[<>]|pH\s*[<>]|[<>]\s*\d|\d+\s*(mL|ml)\s+de\s|\d[\d.,]*\s*%|Solução final|Sugestão|BIC\b|UpToDate\b|O livro\b|A literatura\b|A bula\b)/i;

// Instruction-verb regex used both in isInstruction and tryExtractDrug
const RX_INSTR_VERB = /\b(Tomar|Aplic\w*|Administr\w*|Diluir|Dilua|Utilizar|Utilize|Infund\w*|Reconstitu\w*|Fazer|Faça|Dar\b|Dê\b|Usar\b|Use\b|Ingerir|Ingira|Pingar|Instilar|Repet\w*|Manter\b|Mantenha|Prescrev\w*|Realiz\w*|Colocar|Injetar|Deixar|Adicionar|Iniciar|Inicie|Ministrar|Nebuliz\w*|Borrifar|Passar|Inalar|Bochechar|Bocheche|Lavar\b|Lave\b)\b/i;

const isSection = (l: string) => {
  const t = l.trim();
  // A wrapped prose line starting lowercase (e.g. "tratamento também é...") is a
  // sentence continuation, not a section header — headers are always capitalized.
  if (/^[a-záàâãéêíóôõúç]/.test(t)) return false;
  return /^(Uso\s+(oral|endovenoso|intravenoso|intramuscular|inalatório|tópico|subcutâneo|ocular|retal|nasal|sublingual|vaginal|intravaginal)|Cuidados gerais|Orientaç|Sintom[áa]ticos|Tratamento\b|Critérios|Preparo|Manejo|Medidas|Profilaxia|Posologia|Escolha do|Recomendaç|Fatores de risco|Proped[êe]utica|Farmacoterapia|Apresenta[çc][ãa]o\s+cl[íi]nica|Diagn[óo]stico)/i.test(t);
};

const isConnector = (l: string) =>
  /^(Ou|E\/Ou|Associado a[:.]?|Alternativa[:.]?|\+)\s*$/i.test(l.trim());

const isNoteHeader = (l: string) =>
  /^(Atenção|Detalhes?|Obs|Observaç\w*|Nota|Importante|Racional|B[ôo]nus|Sugestão|Princípios\s+gerais|Protocolo)\b[:.]?/i.test(l.trim());

// Recognizes both action verbs and dilution/reconstitution notes that the ebook
// phrases starting with "Não é necessário..." (which precede the real verb).
const RX_INSTR_NOTE = /^(N[ãa]o é necess|N[ãa]o é preciso|N[ãa]o necessita|N[ãa]o requer|Sem necessidade)/i;
const isInstruction = (l: string) => {
  const t = l.trim();
  if (t.endsWith(":")) return false; // subtitle-like lines are never instructions
  return RX_INSTR_VERB.test(t.slice(0, 15)) || RX_INSTR_NOTE.test(t);
};

// Lab-value thresholds (e.g. "K < 3,5 mEq/L", "Cat > 10,5 mg/dL") are diagnostic
// criteria, not drug doses. Excludes condition definitions from becoming drug cards.
// Note: does NOT match dose conditions like "(ClCr < 30)" — no lab unit after the number.
const RX_LAB_THRESHOLD = /[<>]\s*[\d.,\s~-]+(mEq\/L|mg\/dL|mmol\/L|%)/i;

const isDrug = (l: string) => {
  const t = l.trim();
  if (t.length > 95) return false;
  // A line opening with "(" is a parenthetical continuation of the previous line,
  // never a drug name — let it join upstream instead of forming a stray card.
  if (/^\(/.test(t)) return false;
  // Numbered step "1) Texto sem ----" → instruction/text, not drug.
  // But "1) Medicamento ---- dose" → drug (has separator).
  if (/^\d+\)/.test(t) && !/-{4,}/.test(t)) return false;
  if (RX_LAB_THRESHOLD.test(t)) return false;
  if (NOT_DRUG.test(t)) return false;
  if (/^[a-záàâãéêíóôõúç]/.test(t)) return false;
  if (t.startsWith("→ ")) return false;
  return RX_DOSE.test(t) || RX_FORM.test(t);
};

// Splits a long line that merges a drug name + instruction into one string.
// Returns { drug, instr } or null.
function tryExtractDrug(t: string): { drug: string; instr: string } | null {
  if (t.length <= 95) return null;
  if (/^\(/.test(t)) return null;
  if (t.startsWith("→ ")) return null;
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

const isTableRow = (l: string) => /^[^|]+(\|[^|]+)+$/.test(l.trim());

const isImageMarker = (l: string) => /^\[IMAGE:[^\]]+\]$/.test(l.trim());

const isRenalMarker = (l: string) => /^\[RENAL:[^\]]+\]$/.test(l.trim());

const isNewUnit = (t: string) =>
  t.startsWith("**") || t.startsWith("→ ") || isConnector(t) || isSection(t) || isNoteHeader(t) || isInstruction(t) || isDrug(t) || isSubtitle(t) || isTableRow(t) || isImageMarker(t) || isRenalMarker(t);

const isHeader = (t: string) =>
  isConnector(t) || isSection(t) || isNoteHeader(t) || isSubtitle(t);

// ── Block model ──────────────────────────────────────────────────────────────

type Block =
  | { type: "section"; text: string }
  | { type: "connector"; text: string }
  | { type: "drug"; name: string; qty: string; instructions: string[] }
  | { type: "note"; label: string; body: string[] }
  | { type: "subtitle"; text: string }
  | { type: "text"; text: string }
  | { type: "image"; src: string; caption?: string }
  | { type: "table"; rows: { cells: string[] }[] }
  | { type: "renal"; text: string };

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
  let curTable: Extract<Block, { type: "table" }> | null = null;

  // Next meaningful logical line within the same paragraph (stops at a break).
  const nextLogical = (from: number): string | null => {
    for (let j = from + 1; j < logical.length; j++) {
      if (logical[j] === "\x00") return null;
      const s = logical[j].trim();
      if (s) return s;
    }
    return null;
  };

  for (let li = 0; li < logical.length; li++) {
    const line = logical[li];
    if (line === "\x00") { curTable = null; curNote = null; continue; }
    const t = line.trim();
    if (!t) continue;

    if (isRenalMarker(t)) {
      curDrug = null; curNote = null; curTable = null;
      const text = t.slice(7, -1).trim(); // strip [RENAL: and ]
      blocks.push({ type: "renal", text });
    } else if (isImageMarker(t)) {
      curDrug = null; curNote = null; curTable = null;
      const inner = t.slice(7, -1); // strip [IMAGE: and ]
      const pipeIdx = inner.indexOf("|");
      const src = pipeIdx === -1 ? inner : inner.slice(0, pipeIdx);
      const caption = pipeIdx === -1 ? undefined : inner.slice(pipeIdx + 1).trim();
      blocks.push({ type: "image", src, caption });
    } else if (isTableRow(t)) {
      // Check before isSection/isConnector — a line with | is always a table row
      curDrug = null; curNote = null;
      const cells = t.split("|").map(s => s.trim());
      if (!curTable) {
        curTable = { type: "table", rows: [] };
        blocks.push(curTable);
      }
      curTable.rows.push({ cells });
    } else if (isConnector(t)) {
      curDrug = null; curNote = null; curTable = null;
      blocks.push({ type: "connector", text: t.replace(/[:.]$/, "") });
    } else if (isSection(t)) {
      curDrug = null; curNote = null; curTable = null;
      blocks.push({ type: "section", text: t.replace(/:$/, "") });
    } else if (isNoteHeader(t)) {
      curDrug = null; curTable = null;
      const labelMatch = t.match(/^(Atenção|Detalhes?|Obs\w*|Observaç\w*|Nota|Importante|Racional|B[ôo]nus|Sugestão|Princípios\s+gerais|Protocolo)\b[:.]?/i);
      const label = labelMatch ? labelMatch[1] : "Detalhe";
      const rest = t.replace(/^(Atenção|Detalhes?|Obs\w*|Observaç\w*|Nota|Importante|Racional|B[ôo]nus|Sugestão|Princípios\s+gerais|Protocolo)\b[:.]?\s*/i, "").trim();
      curNote = { type: "note", label, body: rest ? [rest] : [] };
      blocks.push(curNote);
    } else if (isInstruction(t)) {
      curTable = null;
      if (curDrug) curDrug.instructions.push(t);
      else if (curNote) curNote.body.push(t);
      else blocks.push({ type: "text", text: t });
    } else {
      // Check for long merged drug+instruction line before isDrug (which rejects > 95 chars)
      const extracted = tryExtractDrug(t);
      if (extracted) {
        curNote = null; curTable = null;
        const [name, qty] = extracted.drug.split(/\s*-{4,}\s*/);
        curDrug = { type: "drug", name: name.trim(), qty: (qty ?? "").trim(), instructions: [extracted.instr] };
        blocks.push(curDrug);
      } else if (isDrug(t)) {
        curNote = null; curTable = null;
        const [name, qty] = t.split(/\s*-{4,}\s*/);
        // Strip leading "1) " step prefix from drug name
        const cleanName = name.trim().replace(/^\d+\)\s*/, "");
        curDrug = { type: "drug", name: cleanName, qty: (qty ?? "").trim(), instructions: [] };
        blocks.push(curDrug);
      } else if (
        // Dose-less drug name (e.g. "Óleo mineral", "Macrogol+associações"):
        // a short, capitalized, unpunctuated line immediately followed by an instruction.
        !/^[a-záàâãéêíóôõúç]/.test(t) &&
        !t.startsWith("→ ") &&
        t.length <= 60 &&
        !/[.!?:]$/.test(t) &&
        !NOT_DRUG.test(t) &&
        !/^Paciente\b/i.test(t) &&
        !/^[A-ZÁÀÂÃÉÍÓÔÕÚÇ0-9 ]{4,45}$/.test(t) && // all-caps → subtitle, not a drug
        (() => { const nx = nextLogical(li); return nx !== null && isInstruction(nx); })()
      ) {
        curNote = null; curTable = null;
        const cleanName = t.replace(/^\d+\)\s*/, "").trim();
        curDrug = { type: "drug", name: cleanName, qty: "", instructions: [] };
        blocks.push(curDrug);
      } else if (isSubtitle(t)) {
        curDrug = null; curNote = null; curTable = null;
        blocks.push({ type: "subtitle", text: t.replace(/:$/, "") });
      } else if (curNote) {
        curNote.body.push(t);
      } else {
        curDrug = null; curTable = null;
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
      !blk.text.startsWith("**") &&
      !blk.text.startsWith("→ ") &&
      !isSubtitle(blk.text) &&
      !/[.!?]$/.test(prev.text)
    ) {
      prev.text += " " + blk.text;
    } else {
      merged.push(blk);
    }
  }

  return merged;
}

// ── Renderer ─────────────────────────────────────────────────────────────────

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  if (parts.length === 1) return text;
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i} className="font-semibold text-[#0f2d4a] dark:text-[#e8edf5]">{p.slice(2, -2)}</strong>
      : p
  );
}

export default function PrescricaoContent({ conteudo }: { conteudo: string }) {
  const blocks = parse(conteudo);

  return (
    <div className="space-y-2.5">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "section":
            return (
              <p key={i} className="text-[13px] font-extrabold text-[#0f2d4a] dark:text-[#3db8d4] uppercase tracking-wider pt-3 first:pt-0">
                {b.text}
              </p>
            );

          case "drug":
            return (
              <div key={i} className={
                i > 0 && (blocks[i-1].type === "text" || blocks[i-1].type === "subtitle") ? "mt-4 mb-1" :
                i > 0 && (blocks[i-1].type === "drug" || blocks[i-1].type === "note") ? "mt-4 mb-1" :
                "my-2"
              }>
                <div className="inline-flex items-baseline gap-2 border border-[#1a6aad]/35 dark:border-[#3db8d4]/30 bg-[#f0f7ff] dark:bg-[#1a2d45] rounded-lg px-3 py-1.5">
                  <span className="text-[14px] font-bold text-[#0f2d4a] dark:text-[#e8edf5] leading-snug">{b.name.replace(/\s+comprimidos?\b\.?/gi, '').trim()}</span>
                  {b.qty && (
                    <span className="text-[13px] font-semibold text-[#1a6aad] dark:text-[#3db8d4] whitespace-nowrap">{b.qty}</span>
                  )}
                </div>
                {b.instructions.length > 0 && (
                  <div className="mt-1.5 pl-3 border-l-2 border-[#1a6aad]/20 dark:border-[#3db8d4]/25 space-y-1">
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
                        <p key={k} className="text-[13px] text-[#0f2d4a] dark:text-[#9ec4de] leading-relaxed text-justify">{renderInline(ins)}</p>
                      ))}
                  </div>
                )}
              </div>
            );

          case "connector":
            return (
              <div key={i} className="flex items-center gap-3 py-0.5">
                <div className="flex-1 h-px bg-zinc-200 dark:bg-white/10" />
                <span className="text-sm font-bold text-[#0f2d4a] dark:text-[#7db5d0] uppercase tracking-widest">{b.text}</span>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-white/10" />
              </div>
            );

          case "note": {
            const isPrincipios = /princíp/i.test(b.label);
            const isProtocolo = /protocolo/i.test(b.label);
            if (isProtocolo) {
              const raw = b.body[0] ?? "";
              const colonIdx = raw.indexOf(":");
              const descricao = colonIdx !== -1 ? raw.slice(0, colonIdx).trim() : "";
              const sequencia = colonIdx !== -1 ? raw.slice(colonIdx + 1).trim() : raw;
              return (
                <div key={i} className="border-2 border-[#0f2d4a] dark:border-[#3db8d4]/50 bg-[#eaf0f8] dark:bg-[#1a2d45] rounded-lg px-4 py-4 mt-2 text-center">
                  {descricao && (
                    <p className="text-[13px] font-semibold text-[#0f2d4a] dark:text-[#3db8d4] uppercase tracking-wide mb-2">{descricao}</p>
                  )}
                  <p className="text-[15px] font-bold text-[#0f2d4a] dark:text-[#e8edf5] leading-snug">{renderInline(sequencia)}</p>
                  {b.body.slice(1).map((p, k) => (
                    <p key={k} className="text-[14px] font-semibold text-[#0f2d4a] dark:text-[#c8d8e8] mt-1">{renderInline(p)}</p>
                  ))}
                </div>
              );
            }
            return (
              <div key={i} className={`border-l-[3px] ${isPrincipios ? "border-[#0f2d4a] dark:border-[#3db8d4]/60 bg-[#eaf0f8] dark:bg-[#1a2d45]" : "border-[#3db8d4] bg-[#f8fbfd] dark:bg-[#0e1f2d]"} rounded-r-lg pl-3.5 pr-3 py-2.5 mt-8`}>
                <p className={`text-[10px] font-bold ${isPrincipios ? "text-[#0f2d4a] dark:text-[#3db8d4]" : "text-[#1a6aad] dark:text-[#3db8d4]"} uppercase tracking-wider mb-1`}>{isPrincipios ? "Princípios gerais" : "Detalhe"}</p>
                <div className="space-y-1">
                  {b.body.map((p, k) => (
                    <p key={k} className="text-[13px] text-zinc-600 dark:text-[#9ec4de] leading-relaxed text-justify">{renderInline(p)}</p>
                  ))}
                </div>
              </div>
            );
          }

          case "subtitle":
            return (
              <p key={i} className="text-sm font-bold text-[#0f2d4a] dark:text-[#7db5d0] uppercase tracking-wider pt-6 pb-0.5 first:pt-0">
                {b.text.startsWith("→ ") ? b.text.slice(2) : b.text}
              </p>
            );

          case "text":
            if (b.text.startsWith("→ ")) {
              return (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-[#1a6aad] dark:text-[#3db8d4] font-bold text-sm mt-0.5 flex-shrink-0">→</span>
                  <p className="text-sm text-[#0f2d4a] dark:text-[#9ec4de] leading-relaxed">{renderInline(b.text.slice(2))}</p>
                </div>
              );
            }
            if (b.text.startsWith("**") && b.text.endsWith("**") && b.text.length > 4) {
              return (
                <p key={i} className="text-[13px] font-semibold text-[#1a6aad] dark:text-[#7db5d0] pt-1">
                  {b.text.slice(2, -2)}
                </p>
              );
            }
            return (
              <p key={i} className="text-sm text-zinc-600 dark:text-[#9ec4de] leading-relaxed text-justify">{renderInline(b.text)}</p>
            );

          case "image":
            return (
              <figure key={i} className="my-8 flex flex-col items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.src}
                  alt={b.caption ?? ""}
                  className="max-w-full rounded-lg border border-zinc-200 dark:border-white/10 shadow-sm"
                  style={{ maxHeight: 420, objectFit: "contain" }}
                />
                {b.caption && (
                  <figcaption className="text-xs text-zinc-500 dark:text-[#5a7a8e] italic text-center">{b.caption}</figcaption>
                )}
              </figure>
            );

          case "renal": {
            const needsAdjust = /sim|necessário|ajuste|reduz|aumenta|evitar|cuidado/i.test(b.text);
            return (
              <div key={i} className={`flex items-center gap-2.5 mt-6 px-3.5 py-2.5 rounded-xl border ${needsAdjust ? "border-amber-400/40 dark:border-amber-400/25 bg-amber-50 dark:bg-amber-900/10" : "border-emerald-400/40 dark:border-emerald-400/25 bg-emerald-50 dark:bg-emerald-900/10"}`}>
                <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={needsAdjust ? "#d97706" : "#059669"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C7.03 2 3 6.47 3 10c0 5.25 4.5 10.5 9 12 4.5-1.5 9-6.75 9-12 0-3.53-4.03-8-9-8z"/>
                  <path d="M9 12c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z"/>
                </svg>
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${needsAdjust ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    Ajuste por função renal
                  </p>
                  <p className={`text-[13px] font-medium leading-snug ${needsAdjust ? "text-amber-800 dark:text-amber-200" : "text-emerald-800 dark:text-emerald-200"}`}>
                    {b.text}
                  </p>
                </div>
              </div>
            );
          }

          case "table": {
            const colCount = b.rows[0]?.cells.length ?? 2;
            const colWMap: Record<number, string> = { 2: "w-1/2", 3: "w-1/3", 4: "w-1/4", 5: "w-1/5" };
            const colW = colWMap[colCount] ?? "";
            return (
              <div key={i} className="my-2 rounded-lg border border-[#1a6aad]/25 dark:border-[#3db8d4]/20 overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-[#0f2d4a] dark:bg-[#080e1a] text-white">
                      {b.rows[0]?.cells.map((cell, ci) => (
                        <th key={ci} className={`px-3 py-2 text-left font-semibold min-w-[90px] ${colW}`}>{cell}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.slice(1).map((row, k) => (
                      <tr key={k} className={k % 2 === 0 ? "bg-white dark:bg-[#131c2e]" : "bg-[#f0f7ff] dark:bg-[#1a2535]"}>
                        {row.cells.map((cell, ci) => (
                          <td key={ci} className="px-3 py-2 text-zinc-600 dark:text-[#9ec4de] border-t border-zinc-100 dark:border-white/8 min-w-[90px]">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }
      })}
    </div>
  );
}
