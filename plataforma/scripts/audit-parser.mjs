// Rigorous audit — replicates the EXACT parser logic from PrescricaoContent.tsx
// and inspects the resulting blocks for anomalies.
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const content = JSON.parse(readFileSync(join(ROOT, 'lib', 'prescricoes-content.json'), 'utf8'));

// ── Classifiers (mirror of PrescricaoContent.tsx) ──────────────────────────
const RX_DOSE = /\d[\d.,]*\s?(mg|mcg|µg|ml|ml\b|g\b|kg|ui|mmol|meq|%)/i;
const RX_FORM = /\b(F\/A|ampola|comprimido|c[áa]psula|frasco|sach[êe]|supositório|pomada|colírio|creme|gel|spray|inalador|bolsa|solução|suspensão|xarope|gotas?|dr[áa]gea|adesivo|óvulo)\b/i;
const NOT_DRUG = /^(Calcular|Calcule|Exemplo|Verificar|Observar|Atentar|Considerar|Avaliar|Reavaliar|Total |Volume |Dose |Se |Em caso|Na ausência|Para |Diante|Caso |Quando |Conforme|Portanto|Assim |Logo |Pois |Além |Nota |Obs |O2 >|SpO2|Sat\.|SF |SG |RL |NaCl|KCl|Na\s*[<>]|K\s*[<>]|Mg\s*[<>]|pH\s*[<>]|[<>]\s*\d|\d+\s*(mL|ml)\s+de\s|\d+\s*%|Solução final|Sugestão|BIC\b)/i;
const RX_INSTR_VERB = /\b(Tomar|Aplic\w*|Administr\w*|Diluir|Dilua|Utilizar|Utilize|Infund\w*|Reconstitu\w*|Fazer|Faça|Dar\b|Dê\b|Usar\b|Use\b|Ingerir|Ingira|Pingar|Instilar|Repet\w*|Manter\b|Mantenha|Prescrev\w*|Realiz\w*|Colocar|Injetar|Deixar|Adicionar|Iniciar|Inicie|Ministrar|Nebuliz\w*|Borrifar|Passar|Inalar|Bochechar|Bocheche)\b/i;
const isSection = (l) => /^(Uso\s+(oral|endovenoso|intravenoso|intramuscular|inalatório|tópico|subcutâneo|ocular|retal|nasal|sublingual|vaginal|intravaginal)|Cuidados gerais|Orientaç|Sintom[áa]ticos|Tratamento\b|Critérios|Preparo|Manejo|Medidas|Profilaxia|Posologia|Escolha do|Recomendaç)/i.test(l.trim());
const isConnector = (l) => /^(Ou|E\/Ou|Associado a[:.]?|Alternativa[:.]?|\+)\s*$/i.test(l.trim());
const isNoteHeader = (l) => /^(Detalhes?|Obs|Observaç\w*|Nota|Aten[çc]\w*|Importante|Racional|B[ôo]nus|Sugestão)\b[:.]?/i.test(l.trim());
const isInstruction = (l) => RX_INSTR_VERB.test(l.trim().slice(0, 15));
const isDrug = (l) => {
  const t = l.trim();
  if (t.length > 95) return false;
  if (/^\d+\)/.test(t) && !/-{4,}/.test(t)) return false;
  if (NOT_DRUG.test(t)) return false;
  if (/^[a-záàâãéêíóôõúç]/.test(t)) return false;
  return RX_DOSE.test(t) || RX_FORM.test(t);
};
function tryExtractDrug(t) {
  if (t.length <= 95) return null;
  if (/^\d+\)/.test(t) && !/-{4,}/.test(t)) return null;
  if (NOT_DRUG.test(t)) return null;
  if (/^[a-záàâãéêíóôõúç]/.test(t)) return null;
  const m = new RegExp("\\s(" + RX_INSTR_VERB.source + ")", "i").exec(t);
  if (!m || m.index < 5) return null;
  const drugPart = t.slice(0, m.index).trim();
  const instrPart = t.slice(m.index).trim();
  if (drugPart.length > 95) return null;
  if (NOT_DRUG.test(drugPart)) return null;
  if (/^[a-záàâãéêíóôõúç]/.test(drugPart)) return null;
  if (RX_DOSE.test(drugPart) || RX_FORM.test(drugPart)) return { drug: drugPart, instr: instrPart };
  return null;
}
const isSubtitle = (l) => {
  const t = l.trim();
  return (t.endsWith(":") && t.length < 70) || (/^[A-ZÁÀÂÃÉÍÓÔÕÚÇ0-9 ]{4,45}$/.test(t) && t.split(" ").length <= 6);
};
const isImageMarker = (l) => /^\[IMAGE:[^\]]+\]$/.test(l.trim());
const isNewUnit = (t) => isConnector(t) || isSection(t) || isNoteHeader(t) || isInstruction(t) || isDrug(t) || isSubtitle(t) || isImageMarker(t);
const isHeader = (t) => isConnector(t) || isSection(t) || isNoteHeader(t) || isSubtitle(t);

function parse(content) {
  const logical = [];
  let lastWasHeader = false;
  for (const para of content.split(/\n\n+/)) {
    for (const raw of para.split("\n")) {
      const t = raw.trim();
      if (!t) continue;
      if (logical.length === 0 || isNewUnit(t) || lastWasHeader || logical[logical.length - 1] === "\x00") logical.push(t);
      else logical[logical.length - 1] += " " + t;
      lastWasHeader = isHeader(t);
    }
    logical.push("\x00");
    lastWasHeader = false;
  }
  const blocks = [];
  let curDrug = null, curNote = null;
  for (const line of logical) {
    if (line === "\x00") continue;
    const t = line.trim();
    if (!t) continue;
    if (isImageMarker(t)) { curDrug = null; curNote = null; blocks.push({ type: "image", src: t.slice(7, -1) }); }
    else if (isConnector(t)) { curDrug = null; curNote = null; blocks.push({ type: "connector", text: t.replace(/[:.]$/, "") }); }
    else if (isSection(t)) { curDrug = null; curNote = null; blocks.push({ type: "section", text: t.replace(/:$/, "") }); }
    else if (isNoteHeader(t)) { curDrug = null; const rest = t.replace(/^(Detalhes?|Obs\w*|Observaç\w*|Nota|Aten[çc]\w*|Importante|Racional|B[ôo]nus|Sugestão)\b[:.]?\s*/i, "").trim(); curNote = { type: "note", body: rest ? [rest] : [] }; blocks.push(curNote); }
    else if (isInstruction(t)) { if (curDrug) curDrug.instructions.push(t); else if (curNote) curNote.body.push(t); else blocks.push({ type: "text", text: t, orphanInstr: true }); }
    else {
      const extracted = tryExtractDrug(t);
      if (extracted) { curNote = null; const [name, qty] = extracted.drug.split(/\s*-{4,}\s*/); curDrug = { type: "drug", name: name.trim(), qty: (qty ?? "").trim(), instructions: [extracted.instr] }; blocks.push(curDrug); }
      else if (isDrug(t)) { curNote = null; const [name, qty] = t.split(/\s*-{4,}\s*/); curDrug = { type: "drug", name: name.trim().replace(/^\d+\)\s*/, ""), qty: (qty ?? "").trim(), instructions: [] }; blocks.push(curDrug); }
      else if (curNote) curNote.body.push(t);
      else if (isSubtitle(t)) { curDrug = null; blocks.push({ type: "subtitle", text: t.replace(/:$/, "") }); }
      else { curDrug = null; blocks.push({ type: "text", text: t }); }
    }
  }
  return blocks;
}

// ── Anomaly detection ──────────────────────────────────────────────────────
const findings = [];
function flag(id, sev, type, detail) { findings.push({ id, sev, type, detail: detail.replace(/\n/g,'↵').slice(0,110) }); }

// Fragments that should never be a drug NAME
const DRUG_NAME_BAD = [
  /Não é necessário/i, /^\(/, /^\d+g?\s+de\s+\d+\/\d+h/i, /^\d+\s*(mg|ml|g)\)/i,
  /^Frasco\b/i, /^Bolsa\b/i, /-\s*(Bolsa|Frasco)\s*$/i, /-{3,}/, /^UI\//i,
  /^por\s/i, /Lidocaína/i, /^\d+\s*mg\s+de\s+/i, /vasoconstr/i,
  /\b(e\/ou|para essa|para o)\s*$/i,
];
// Drug name that looks truncated (ends with connector/preposition or has no dose but next line has the dose)
const NAME_TRUNCATED = /\b(injetável|solução|suspensão|comprimido|cápsula|ampola|frasco)\s*-\s*$/i;

for (const [id, text] of Object.entries(content)) {
  const blocks = parse(text);
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];

    if (b.type === "drug") {
      // 1. Drug name matches a known bad fragment
      for (const rx of DRUG_NAME_BAD) {
        if (rx.test(b.name)) { flag(id, 'ALTA', 'NOME DE MEDICAMENTO SUSPEITO', `"${b.name}"`); break; }
      }
      // 2. Drug name looks truncated (ends with "injetável -" etc.)
      if (NAME_TRUNCATED.test(b.name)) flag(id, 'ALTA', 'NOME TRUNCADO', `"${b.name}"`);
      // 3. Drug with no instructions AND next block is also a drug fragment (orphan)
      if (b.instructions.length === 0) {
        const nxt = blocks[i+1];
        if (!nxt || (nxt.type !== 'drug' && nxt.type !== 'connector' && nxt.type !== 'section')) {
          // drug with no instruction and next isn't another drug/connector — could be fine (grouped) but flag short odd names
        }
      }
      // 4. Instruction contains embedded dose that reads like a second drug ("500 mg de vancomicina")
      // (informational only — already inline, safe)
    }

    // 5. Orphan instruction (instruction verb but rendered as loose text — no drug context)
    if (b.type === "text" && b.orphanInstr) {
      flag(id, 'ALTA', 'INSTRUÇÃO ÓRFÃ (vira texto solto)', `"${b.text}"`);
    }

    // 6. Section header with extra content after the colon
    if (b.type === "section") {
      // section text already had ":" stripped; check original patterns via raw text
    }
  }

  // 7. Raw-line checks (independent of parser) ──────────────────────────────
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    // Section header line with trailing content: "Uso oral: caso..."
    if (/^Uso\s+\w+\s*:\s*\S/i.test(t)) flag(id, 'ALTA', 'SEÇÃO COM CONTEÚDO EXTRA', t);
    // Dashes artifact in the middle of a line
    if (/-{4,}/.test(t) && !/^\s*-{4,}\s*$/.test(t)) flag(id, 'MÉDIA', 'TRAÇOS PDF EM LINHA', t);
    // Numbered item glued to title end: "... SOFA 2:" style — number before colon following text
    // (heuristic: a lone digit right before ":" preceded by a letter word)
    if (/[a-záéíóúâ]\s+\d\s*:$/i.test(t) && t.length < 70) flag(id, 'BAIXA', 'POSSÍVEL NÚMERO NO TÍTULO', t);
  }

  // 8. Repeated identical non-trivial lines (PDF page headers) ───────────────
  const counts = {};
  for (const l of lines) { const t = l.trim(); if (t.length > 8 && !isInstruction(t)) counts[t] = (counts[t]||0)+1; }
  for (const [l, ct] of Object.entries(counts)) {
    if (ct >= 3 && /^[A-ZÁÀÂÃÉÍÓÔÕÚÇ]/.test(l) && !l.endsWith('.')) flag(id, 'MÉDIA', `LINHA REPETIDA ${ct}x`, l);
  }
}

// ── Report ──────────────────────────────────────────────────────────────────
const order = { ALTA: 0, MÉDIA: 1, BAIXA: 2 };
findings.sort((a,b) => order[a.sev] - order[b.sev] || a.id.localeCompare(b.id));
const bySev = {};
for (const f of findings) (bySev[f.sev] = bySev[f.sev]||[]).push(f);
for (const sev of ['ALTA','MÉDIA','BAIXA']) {
  const items = bySev[sev] || [];
  if (!items.length) continue;
  console.log(`\n━━━━━ SEVERIDADE ${sev} (${items.length}) ━━━━━`);
  for (const f of items) console.log(`  [${f.id.padStart(3)}] ${f.type}: ${f.detail}`);
}
console.log(`\n\nTOTAL: ${findings.length} achados em ${new Set(findings.map(f=>f.id)).size} tópicos`);
