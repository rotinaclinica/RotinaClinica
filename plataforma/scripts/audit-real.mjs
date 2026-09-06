// Precise audit — only genuine structural breaks, mirroring the parser.
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const content = JSON.parse(readFileSync(join(ROOT, 'lib', 'prescricoes-content.json'), 'utf8'));

const RX_DOSE = /\d[\d.,]*\s?(mg|mcg|µg|ml|ml\b|g\b|kg|ui|mmol|meq|%)/i;
const RX_FORM = /\b(F\/A|ampola|comprimido|c[áa]psula|frasco|sach[êe]|supositório|pomada|colírio|creme|gel|spray|inalador|bolsa|solução|suspensão|xarope|gotas?|dr[áa]gea|adesivo|óvulo)\b/i;
const NOT_DRUG = /^(Calcular|Calcule|Exemplo|Verificar|Observar|Atentar|Considerar|Avaliar|Reavaliar|Total |Volume |Dose |Se |Em caso|Na ausência|Para |Diante|Caso |Quando |Conforme|Portanto|Assim |Logo |Pois |Além |Nota |Obs |O2 >|SpO2|Sat\.|SF |SG |RL |NaCl|KCl|Na\s*[<>]|K\s*[<>]|Mg\s*[<>]|pH\s*[<>]|[<>]\s*\d|\d+\s*(mL|ml)\s+de\s|\d+\s*%|Solução final|Sugestão|BIC\b)/i;
const RX_INSTR_VERB = /\b(Tomar|Aplic\w*|Administr\w*|Diluir|Dilua|Utilizar|Utilize|Infund\w*|Reconstitu\w*|Fazer|Faça|Dar\b|Dê\b|Usar\b|Use\b|Ingerir|Ingira|Pingar|Instilar|Repet\w*|Manter\b|Mantenha|Prescrev\w*|Realiz\w*|Colocar|Injetar|Deixar|Adicionar|Iniciar|Inicie|Ministrar|Nebuliz\w*|Borrifar|Passar|Inalar|Bochechar|Bocheche)\b/i;
const isSection = (l) => /^(Uso\s+(oral|endovenoso|intravenoso|intramuscular|inalatório|tópico|subcutâneo|ocular|retal|nasal|sublingual|vaginal|intravaginal)|Cuidados gerais|Orientaç|Sintom[áa]ticos|Tratamento\b|Critérios|Preparo|Manejo|Medidas|Profilaxia|Posologia|Escolha do|Recomendaç)/i.test(l.trim());
const isConnector = (l) => /^(Ou|E\/Ou|Associado a[:.]?|Alternativa[:.]?|\+)\s*$/i.test(l.trim());
const isNoteHeader = (l) => /^(Detalhes?|Obs|Observaç\w*|Nota|Aten[çc]\w*|Importante|Racional|B[ôo]nus|Sugestão)\b[:.]?/i.test(l.trim());
const RX_INSTR_NOTE = /^(N[ãa]o é necess|N[ãa]o é preciso|N[ãa]o necessita|N[ãa]o requer|Sem necessidade)/i;
const isInstruction = (l) => RX_INSTR_VERB.test(l.trim().slice(0, 15)) || RX_INSTR_NOTE.test(l.trim());
const RX_LAB_THRESHOLD = /[<>]\s*[\d.,\s~-]+(mEq\/L|mg\/dL|mmol\/L|%)/i;
const isDrug = (l) => {
  const t = l.trim();
  if (t.length > 95) return false;
  if (/^\(/.test(t)) return false;
  if (/^\d+\)/.test(t) && !/-{4,}/.test(t)) return false;
  if (RX_LAB_THRESHOLD.test(t)) return false;
  if (NOT_DRUG.test(t)) return false;
  if (/^[a-záàâãéêíóôõúç]/.test(t)) return false;
  return RX_DOSE.test(t) || RX_FORM.test(t);
};
const isSubtitle = (l) => {
  const t = l.trim();
  return (t.endsWith(":") && t.length < 70) || (/^[A-ZÁÀÂÃÉÍÓÔÕÚÇ0-9 ]{4,45}$/.test(t) && t.split(" ").length <= 6);
};

const findings = [];
function flag(id, type, detail) { findings.push({ id, type, detail: detail.replace(/\n/g,'↵') }); }

for (const [id, text] of Object.entries(content)) {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t) continue;

    // ── BUG 1: numbered drug glued to end of an instruction ──────────────────
    // "...febre. 2) Ibuprofeno 600 mg" — the numbered drug loses its card
    const gluedDrug = /[.)]\s+(\d+\)\s*[A-ZÁ][^.]*\b(mg|mcg|ml|g|UI|F\/A|comprimido|ampola|c[áa]psula|frasco|gotas)\b)/i.exec(t);
    if (gluedDrug && isInstruction(t)) flag(id, 'MEDICAMENTO COLADO NA INSTRUÇÃO', t);

    // ── BUG 2: subtitle/number glued to end of an instruction ────────────────
    // "Iniciar com 5 a 20 ml/h. 2) Sedação"
    const gluedSub = /\.\s+\d+\)\s*[A-ZÁ][a-zç]+\s*$/.exec(t);
    if (gluedSub && isInstruction(t)) flag(id, 'SUBTÍTULO COLADO NA INSTRUÇÃO', t);

    // ── BUG 3: drug NAME that is a stray parenthetical/fragment ──────────────
    // Only when the line WILL be classified as a drug (isDrug true) but starts with "("
    if (isDrug(t) && /^\(/.test(t)) flag(id, 'CARD = FRAGMENTO ENTRE PARÊNTESES', t);

    // ── BUG 4: section header with real trailing content ─────────────────────
    if (/^Uso\s+\w+\s*:\s*\S/i.test(t)) flag(id, 'SEÇÃO COM CONTEÚDO EXTRA', t);

    // ── BUG 5: drug name truncated (ends with "injetável -", "- Bolsa", etc.) ─
    if (isDrug(t) && /\b(injetável|solução|suspensão)\s*-\s*$/i.test(t)) flag(id, 'NOME TRUNCADO (termina em traço)', t);
    if (isDrug(t) && /-\s*(Bolsa|Frasco)\s*$/i.test(t)) flag(id, 'NOME COM SUFIXO DE EMBALAGEM', t);

    // ── BUG 6: "Não é necessário" starting a line right after a drug ─────────
    if (/^Não é necessário/i.test(t) && i > 0) {
      const prev = lines[i-1].trim();
      if (isDrug(prev)) flag(id, 'NÃO É NECESSÁRIO APÓS MEDICAMENTO', `prev="${prev.slice(0,45)}" | "${t.slice(0,45)}"`);
    }

    // ── BUG 7: title line glued to next via "(...e/ou" open paren at end ─────
    if (/\([^)]*\b(e\/ou|ou)\s*$/i.test(t) && t.length < 60 && /^[A-ZÁÀÂÃÉÍÓÔÕÚÇ]/.test(t)) {
      // an all-caps-ish short heading with an unbalanced open paren ending in e/ou
      if (isDrug(t)) flag(id, 'TÍTULO/CARD COM PARÊNTESE ABERTO', t);
    }

    // ── BUG 8: instruction verb line split so continuation orphans ───────────
    // "Diluir ... em 100 ml de SG" \n "5%, infundir..." — continuation starts with digit+comma
    if (i + 1 < lines.length) {
      const nxt = lines[i+1].trim();
      if (isInstruction(t) && /^\d+%?,/.test(nxt) && !isDrug(nxt)) {
        // Only a concern if the instruction is itself orphan (no drug card owns it)
        // Detect: nearest preceding non-empty structural line is not a drug
        let j = i - 1, owner = null;
        while (j >= 0) { const p = lines[j].trim(); if (p) { owner = p; break; } j--; }
        if (owner && !isDrug(owner) && !isInstruction(owner)) flag(id, 'INSTRUÇÃO QUEBRADA ÓRFÃ', `"${t.slice(0,40)}" + "${nxt.slice(0,30)}"`);
      }
    }
  }
}

const byType = {};
for (const f of findings) (byType[f.type] = byType[f.type]||[]).push(f);
for (const [type, items] of Object.entries(byType)) {
  console.log(`\n━━ ${type} (${items.length}) ━━`);
  for (const f of items) console.log(`  [${f.id.padStart(3)}] ${f.detail.slice(0,105)}`);
}
console.log(`\nTOTAL: ${findings.length} achados reais em ${new Set(findings.map(f=>f.id)).size} tópicos`);
