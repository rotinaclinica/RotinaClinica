"use client";

/**
 * Renders raw prescription text into structured, readable blocks.
 * Detects: section headers, drug lines, connectors, instructions, sub-headers.
 */

// ── Classifiers ──────────────────────────────────────────────────────────────

// "Uso intramuscular:", "Cuidados gerais:", etc.
const isSectionHeader = (line: string) =>
  /^(Uso\s+(oral|endovenoso|intravenoso|intramuscular|inalatório|tópico|subcutâneo|ocular|retal|nasal|sublingual)|Cuidados gerais|Orientações?|Tratamento:|Critérios diagnósticos?|Preparo|Manejo|Atenção|Obs[.:]|Nota[.:])/i.test(line.trim());

// "Adrenalina 1 mg/ml ---- 02 frascos" or "Metformina 500 mg"
const isDrugLine = (line: string) =>
  /(\d+\s?(mg|mcg|ml|mL|g|UI|mmol|meq|%)|F\/A|ampola|comprimido|frasco|cápsula|sachê|supositório|pomada|colírio|spray|inalador|bolsa|solução|suspensão)/i.test(line) &&
  line.length < 200;

// "Ou", "E/Ou", "+", "Associado a:", separators
const isConnector = (line: string) =>
  /^(Ou|E\/Ou|Associado a[:]?|Alternativa[:]?|\+\s*$)$/i.test(line.trim());

// Section-level sub-title (indented, short, ends with ":" or is all caps phrase)
const isSubtitle = (line: string) => {
  const t = line.trim();
  return (
    (t.endsWith(":") && t.length < 80 && !isSectionHeader(t) && !isDrugLine(t)) ||
    (/^[A-ZÁÀÂÃÉÍÓÔÕÚÇ\s]{5,40}$/.test(t) && t.length < 60)
  );
};

// ── Token types ──────────────────────────────────────────────────────────────

type Token =
  | { type: "section"; text: string }
  | { type: "subtitle"; text: string }
  | { type: "drug"; text: string; detail: string }
  | { type: "connector"; text: string }
  | { type: "text"; text: string }
  | { type: "divider" };

function tokenize(content: string): Token[] {
  const tokens: Token[] = [];
  const paragraphs = content.split(/\n\n+/);

  for (const para of paragraphs) {
    const lines = para.split("\n").map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    for (const line of lines) {
      if (!line) continue;

      if (isConnector(line)) {
        tokens.push({ type: "connector", text: line });
      } else if (isSectionHeader(line)) {
        tokens.push({ type: "section", text: line.replace(/:$/, "") });
      } else if (isSubtitle(line)) {
        tokens.push({ type: "subtitle", text: line.replace(/:$/, "") });
      } else if (isDrugLine(line)) {
        // Split "Medicamento ---- qty" or just the drug line
        const parts = line.split(/\s*----\s*/);
        tokens.push({ type: "drug", text: parts[0].trim(), detail: parts[1]?.trim() ?? "" });
      } else {
        tokens.push({ type: "text", text: line });
      }
    }

    tokens.push({ type: "divider" });
  }

  return tokens;
}

// ── Renderer ─────────────────────────────────────────────────────────────────

export default function PrescricaoContent({ conteudo }: { conteudo: string }) {
  const tokens = tokenize(conteudo);
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const token of tokens) {
    key++;
    switch (token.type) {
      case "section":
        elements.push(
          <div key={key} className="flex items-center gap-2 mt-5 mb-2 first:mt-0">
            <span className="inline-flex items-center gap-1.5 bg-[#0f2d4a] text-[#3db8d4] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              {token.text}
            </span>
          </div>
        );
        break;

      case "subtitle":
        elements.push(
          <p key={key} className="text-xs font-bold text-zinc-500 uppercase tracking-wider mt-3 mb-1">
            {token.text}
          </p>
        );
        break;

      case "drug":
        elements.push(
          <div key={key} className="bg-[#f0f7ff] border border-[#c8dfef] rounded-xl px-4 py-2.5 my-1">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <p className="text-sm font-bold text-[#0f2d4a] leading-snug">{token.text}</p>
              {token.detail && (
                <span className="text-xs font-semibold text-[#1a6aad] bg-white border border-[#c8dfef] px-2 py-0.5 rounded-full flex-shrink-0">
                  {token.detail}
                </span>
              )}
            </div>
          </div>
        );
        break;

      case "connector":
        elements.push(
          <div key={key} className="flex items-center gap-2 my-1.5">
            <div className="flex-1 h-px bg-zinc-200" />
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-2">
              {token.text}
            </span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>
        );
        break;

      case "text":
        elements.push(
          <p key={key} className="text-sm text-zinc-600 leading-relaxed my-1">
            {token.text}
          </p>
        );
        break;

      case "divider":
        elements.push(<div key={key} className="h-1" />);
        break;
    }
  }

  return <div className="space-y-0">{elements}</div>;
}
