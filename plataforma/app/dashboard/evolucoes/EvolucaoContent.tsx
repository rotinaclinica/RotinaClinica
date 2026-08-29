"use client";

// ── Block types ───────────────────────────────────────────────────────────────
type Block =
  | { type: "title"; text: string }
  | { type: "section"; text: string }
  | { type: "field"; label: string; value: string }
  | { type: "sub-text"; text: string }
  | { type: "list-item"; text: string }
  | { type: "text"; text: string };

// ── Helpers ───────────────────────────────────────────────────────────────────
const LOWER_PT = new Set(["e", "de", "do", "da", "dos", "das", "ou", "em", "a", "o", "para", "sem", "com"]);

function toProperCase(str: string): string {
  return str.toLowerCase().split(" ").map((word, i) => {
    if (!word) return word;
    const stripped = word.replace(/[^a-záéíóúàâêôãõç]/gi, "");
    if (i > 0 && LOWER_PT.has(stripped)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(" ");
}

const MEDICAL_ABBREVS = [
  "BEG", "REG", "MEG", "RHA", "RHD", "FC", "FR", "PA", "TEC", "SpO2", "SaO2",
  "BNF", "2T", "3T", "4T", "RCR", "MMII", "MMSS", "IVAS", "GEA", "ITU",
  "SCA", "IAM", "HAS", "SF", "SG", "RL", "IV", "IM", "SC", "VO", "EV", "ID",
  "ECG", "EEG", "TC", "RM", "UTI", "UPA", "UBS", "PS", "ACV", "ABD", "NEURO",
  "VHS", "PCR", "HMG", "RX", "HDA", "HPP", "COVID", "HIV", "HCV", "HBV",
  "DM", "IRC", "ICC", "AVE", "AVC", "TEP", "TVP", "DPOC", "SUS", "4Q", "Sat.O2",
  "BNF", "S/", "C/", "SNS", "RHA", "mmHg", "LOTE", "MVF+", "Ciprofloxacino",
  "AAS", "PANI", "HEART", "SCA", "IAM", "ST", "AINES", "Glasgow", "FID",
];

function toSentenceCase(str: string): string {
  let s = str.toLowerCase();
  // Capitalize start and after sentence-ending punctuation
  s = s.replace(/(^|[.!?]\s+|\s+-\s+)([a-záéíóúàâêôãõç])/gi,
    (_, punct, letter) => punct + letter.toUpperCase());
  // Re-uppercase medical abbreviations
  for (const abbrev of MEDICAL_ABBREVS) {
    const esc = abbrev.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    s = s.replace(new RegExp(`\\b${esc}(?=\\W|$)`, "gi"), abbrev);
  }
  return s;
}

function formatLabel(label: string): string {
  return label.toUpperCase().trim();
}

// ── Classifiers ───────────────────────────────────────────────────────────────
const SECTION_RE = /^(ANAMNESE|EF|HD E CONDUTA|CONDUTAS)\b/i;
const SECTION_MAP: Record<string, string> = {
  ANAMNESE: "Anamnese",
  EF: "Exame Físico",
  "HD E CONDUTA": "Hipótese Diagnóstica",
  CONDUTAS: "Condutas",
};

const FIELD_LABELS_TOP = [
  "HDA", "HPP",
  "MEDICAÇÕES EM USO DOMICILIAR", "MEDICAÇÕES DE USO DOMICILIAR",
  "GERAL", "PELE", "MUCOSA",
  "HIPÓTESE DIAGNÓSTICA", "HIPOTESE DIAGNOSTICA",
];
// Inline EF sub-labels that appear embedded inside the GERAL value
const EF_SUB_LABELS = ["NEURO", "AR", "ACV", "ABD", "MMII", "PELE", "MUCOSA", "OROSCOPIA", "FACE"];
const ALL_FIELD_LABELS = [...FIELD_LABELS_TOP, ...EF_SUB_LABELS, "ALERGIAS", "COMORBIDADES", "TABAGISMO", "ETILISMO"];

const FIELD_RE = new RegExp(
  `^(${FIELD_LABELS_TOP.map(l => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")}):(.*)$`,
  "i"
);

// Split a long EF value that contains inline sub-labels
const EF_SPLIT_RE = new RegExp(
  `\\b(${EF_SUB_LABELS.map(l => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")}):`,
  "gi"
);

function splitEfValue(firstLabel: string, firstValue: string): Block[] {
  const combined = firstValue;
  const parts = combined.split(EF_SPLIT_RE);
  const blocks: Block[] = [];
  // parts[0] = value for firstLabel; then alternating [label, value, label, value...]
  blocks.push({ type: "field", label: formatLabel(firstLabel), value: parts[0].trim() });
  for (let i = 1; i < parts.length; i += 2) {
    const lbl = parts[i];
    const val = (parts[i + 1] ?? "").trim();
    if (lbl) blocks.push({ type: "field", label: formatLabel(lbl), value: val });
  }
  return blocks;
}

// ── Condutas line-joining heuristic ──────────────────────────────────────────
const CONDUTA_VERB_START = /^(FORNEÇO|ORIENTO|TRANSFIRO|PRESCREVO|IN[IÍ]CIO|MANTENHO|SOLICITO|ENTRO|APENAS|HIDRATA[ÇC][AÃ]O|SINT[OÔ]M[AÁ]TICOS\s+(POR|EV|VO|ID)|APLICO|REALIZO|ENCAMINHO|COLOCO|ADMINISTRO|MONITORO|OBSERVO|OTIMIZO|REAVALIA[ÇC][AÃ]O|ANALGESIA|OXIG[EÊ]NIO|SUMATRIPTANO)/i;
const ENDS_WITH_PREP = /\b(COM|DE|OU|E|PARA|SEM|NA|NO|DOS|DAS|DO|DA|A|O|EM|AO)\s*$/i;
const DEFINITE_CONTINUATION = /^(DA\b|DAS\b|DO\b|DOS\b|DESTES\b|PROCURAR\b|PRESEN[ÇC]A\b|ATENDIMENTO\b|ACOMPANHAMENTO\b|AMBULATORIAL\b|PRESSÓRICO\b|DOMICILIAR\b|DOMICILIARES\b|CORONARIANA\b|AGUDA\b|VASCULAR\b|ENCEFÁLICO\b|DISSEC[ÇC]ÃO\b|INVESTIGAÇÃO\b|ETIOLÓGICA\b|REFERÊNCIA\b|EMERGÊNCIA\b|MÍNIMO\b)/i;

function joinCondutas(chunks: string[]): string[] {
  const items: string[] = [];
  let current = "";

  for (const raw of chunks) {
    const chunk = raw.trim();
    if (!chunk) continue;

    if (!current) { current = chunk; continue; }

    if (DEFINITE_CONTINUATION.test(chunk)) {
      current += " " + chunk;
    } else if (CONDUTA_VERB_START.test(chunk)) {
      items.push(current);
      current = chunk;
    } else if (ENDS_WITH_PREP.test(current)) {
      // Previous ended with preposition → this is a continuation
      current += " " + chunk;
    } else {
      // Unknown: join (safer than splitting incorrectly)
      current += " " + chunk;
    }
  }

  if (current) items.push(current);
  return items;
}

// ── Parser ────────────────────────────────────────────────────────────────────
function parse(raw: string): Block[] {
  const lines = raw.split("\n").map(l => l.trim());
  const blocks: Block[] = [];

  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    if (SECTION_RE.test(lines[i])) { start = i; break; }
  }

  let conductasBuffer: string[] = [];
  let inCondutas = false;
  let lastSectionKey = "";

  const flushCondutas = () => {
    const items = joinCondutas(conductasBuffer);
    for (const item of items) {
      if (item) blocks.push({ type: "list-item", text: item });
    }
    conductasBuffer = [];
    inCondutas = false;
  };

  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    if (inCondutas && SECTION_RE.test(line)) flushCondutas();

    const sectionMatch = line.match(SECTION_RE);
    if (sectionMatch) {
      const key = sectionMatch[1].toUpperCase();
      const sectionLabel = SECTION_MAP[key] ?? toProperCase(key);

      if (key === "CONDUTAS") {
        blocks.push({ type: "section", text: sectionLabel });
        inCondutas = true;
        lastSectionKey = key;
        continue;
      }

      if (key === "ANAMNESE") {
        const rest = line.replace(/^ANAMNESE\s*:\s*/i, "").trim();
        if (rest) blocks.push({ type: "title", text: toProperCase(rest) });
        blocks.push({ type: "section", text: sectionLabel });
        lastSectionKey = key;
        continue;
      }

      // Suppress duplicate section headers (e.g. second EF block)
      if (key !== lastSectionKey) {
        blocks.push({ type: "section", text: sectionLabel });
      }
      lastSectionKey = key;
      continue;
    }

    if (inCondutas) {
      conductasBuffer.push(line);
      continue;
    }

    const fieldMatch = line.match(FIELD_RE);
    if (fieldMatch) {
      const rawLabel = fieldMatch[1].toUpperCase().trim();
      const value = fieldMatch[2].trim();
      const label = formatLabel(rawLabel);

      // HPP: emit as header then split sub-fields from value
      if (rawLabel === "HPP") {
        blocks.push({ type: "field", label, value: "" });
        if (value) {
          const subFields = value.split(/\s+(?=[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ\/]+:)/).filter(Boolean);
          for (const sf of subFields) blocks.push({ type: "sub-text", text: sf.trim() });
        }
        continue;
      }

      // GERAL: may contain inline EF sub-labels
      if (rawLabel === "GERAL" && EF_SPLIT_RE.test(value)) {
        EF_SPLIT_RE.lastIndex = 0;
        const subBlocks = splitEfValue(rawLabel, value);
        blocks.push(...subBlocks);
        continue;
      }

      blocks.push({ type: "field", label, value });
      continue;
    }

    blocks.push({ type: "text", text: line });
  }

  if (inCondutas) flushCondutas();
  return blocks;
}

// ── Texto para copiar ─────────────────────────────────────────────────────────
// Usa o MESMO parser da tela, então o texto copiado sai limpo (sem caixa alta,
// com condutas unidas e "EF"→"Exame Físico"). Exclui o título do modelo e a
// seção "Anamnese", como pedido — mantém o restante das seções.
export function evolucaoToPlainText(conteudo: string): string {
  const all = parse(conteudo);
  const titleCount = all.filter((b) => b.type === "title").length;
  const blocks = titleCount > 1 ? all : all.filter((b) => b.type !== "title");

  const lines: string[] = [];
  for (const b of blocks) {
    switch (b.type) {
      case "title":
        break; // exclui o título do modelo
      case "section":
        if (b.text.trim().toLowerCase() === "anamnese") break; // exclui "Anamnese"
        if (lines.length) lines.push("");
        lines.push(b.text);
        break;
      case "field": {
        const isHd = b.label === "HIPÓTESE DIAGNÓSTICA" || b.label === "HIPOTESE DIAGNOSTICA";
        const isEf = new Set(["GERAL","NEURO","AR","ACV","ABD","MMII","PELE","MUCOSA","OROSCOPIA","FACE"]).has(b.label);
        if (isHd) {
          const v = toSentenceCase(b.value);
          lines.push(/[.!?:]$/.test(v) ? v : v + ".");
        } else {
          const prefix = isEf ? "• " : "";
          lines.push(b.value ? `${prefix}${b.label}: ${toSentenceCase(b.value)}` : `${prefix}${b.label}:`);
        }
        break;
      }
      case "sub-text":
        lines.push(`• ${b.text}`);
        break;
      case "list-item": {
        const t = toSentenceCase(b.text);
        lines.push(`• ${/[.!?:]$/.test(t) ? t : t + "."}`);
        break;
      }
      case "text":
        lines.push(toSentenceCase(b.text));
        break;
    }
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// ── Renderer ──────────────────────────────────────────────────────────────────
const EF_FIELD_LABELS = new Set(["GERAL", "NEURO", "AR", "ACV", "ABD", "MMII", "PELE", "MUCOSA", "OROSCOPIA", "FACE"]);

export default function EvolucaoContent({ conteudo }: { conteudo: string }) {
  const allBlocks = parse(conteudo);
  const titleCount = allBlocks.filter(b => b.type === "title").length;
  const blocks = titleCount > 1 ? allBlocks : allBlocks.filter(b => b.type !== "title");

  return (
    <div className="text-sm space-y-1">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "title":
            return (
              <div key={i} className="mt-6 mb-3 -mx-5 px-5 py-2 bg-[#e8f4fc] dark:bg-[#1a2d45] border-y border-[#c8e4f5] dark:border-[#1e3a5c]">
                <p className="text-[10px] font-bold text-[#1a6aad] dark:text-[#3db8d4] uppercase tracking-widest">
                  {block.text}
                </p>
              </div>
            );

          case "section":
            return (
              <h4 key={i} className="mt-5 first:mt-0 mb-1.5 font-extrabold text-[#0f2d4a] dark:text-[#3db8d4] text-sm">
                {block.text}
              </h4>
            );

          case "field": {
            const prevIsSubText = i > 0 && blocks[i - 1].type === "sub-text";
            const isHpp = block.label === "HPP";
            const isEf = EF_FIELD_LABELS.has(block.label);
            const isHd = block.label === "HIPÓTESE DIAGNÓSTICA" || block.label === "HIPOTESE DIAGNOSTICA";
            if (isHd) {
              const hdTxt = toSentenceCase(block.value);
              const hdWithDot = /[.!?:]$/.test(hdTxt) ? hdTxt : hdTxt + ".";
              return (
                <p key={i} className="text-justify leading-relaxed mb-1 text-zinc-700 dark:text-white">
                  {hdWithDot}
                </p>
              );
            }
            if (isEf) {
              return (
                <div key={i} className="flex items-baseline gap-2 mb-1">
                  <span className="text-zinc-400 dark:text-[#6a8fa5] flex-shrink-0">•</span>
                  <p className="text-justify leading-relaxed">
                    <span className="font-bold text-[#0f2d4a] dark:text-white">{block.label}: </span>
                    {block.value && <span className="text-zinc-700 dark:text-white">{toSentenceCase(block.value)}</span>}
                  </p>
                </div>
              );
            }
            return (
              <p key={i} className={`text-justify leading-relaxed mb-1${prevIsSubText ? " mt-3" : ""}${isHpp ? " mt-5" : ""}`}>
                <span className="font-bold text-[#0f2d4a] dark:text-white">{block.label}: </span>
                {block.value && (
                  <span className="text-zinc-700 dark:text-white">{toSentenceCase(block.value)}</span>
                )}
              </p>
            );
          }

          case "sub-text":
            return (
              <div key={i} className="flex items-baseline gap-2 mb-1">
                <span className="text-zinc-400 dark:text-[#6a8fa5] flex-shrink-0">•</span>
                <p className="text-zinc-600 dark:text-white leading-relaxed text-justify">{block.text}</p>
              </div>
            );

          case "list-item": {
            const txt = toSentenceCase(block.text);
            const withDot = /[.!?:]$/.test(txt) ? txt : txt + ".";
            return (
              <div key={i} className="flex items-baseline gap-2 mb-1">
                <span className="text-zinc-400 dark:text-[#6a8fa5] flex-shrink-0">•</span>
                <p className="text-zinc-600 dark:text-white text-justify leading-relaxed">
                  {withDot}
                </p>
              </div>
            );
          }

          case "text":
            return (
              <p key={i} className="text-zinc-600 dark:text-white text-justify leading-relaxed pl-3">
                {toSentenceCase(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
