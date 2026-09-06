// Comprehensive content audit — find all suspicious patterns across 114 topics
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const content = JSON.parse(readFileSync(join(ROOT, 'lib', 'prescricoes-content.json'), 'utf8'));

const issues = [];
function flag(id, type, excerpt) {
  issues.push({ id, type, excerpt: excerpt.replace(/\n/g, '↵').slice(0, 120) });
}

for (const [id, text] of Object.entries(content)) {
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // ── 1. Section header com conteúdo extra após os prefixos conhecidos ───────
    // "Uso oral: caso", "Uso intramuscular: 1 mg/mL -", etc.
    if (/^Uso\s+(oral|endovenoso|intramuscular|IM|EV|subcutâneo|tópico|inalatório|intranasal)\s*:/i.test(trimmed)) {
      // Should end at ":" or ":" + whitespace only
      const afterColon = trimmed.replace(/^Uso\s+\S+\s*:\s*/i, '').trim();
      if (afterColon.length > 0) {
        flag(id, 'SEÇÃO COM EXTRA', line);
      }
    }
    // Other section patterns that shouldn't have extra text
    if (/^(Cuidados gerais|Detalhes?|Observaç|Via de|Dose e posologia|Reações adversas)\s*:/i.test(trimmed)) {
      const afterColon = trimmed.replace(/^[^:]+:\s*/, '').trim();
      if (afterColon.length > 3 && !/^\(/.test(afterColon)) {
        flag(id, 'SEÇÃO/NOTA COM EXTRA', line);
      }
    }

    // ── 2. Drug name ending with connectors or prepositions ────────────────────
    if (/\bmg\b|\bmL\b|\bUI\b|\bg\b|\bampola\b|\bcápsula\b|\bcomprimido\b/i.test(trimmed)) {
      if (/\s(e\/ou|e\s*\/|\/\s*ou|para\s*essa|para\s*o|via\s+\w+)\s*$/.test(trimmed)) {
        flag(id, 'MEDICAMENTO COM FRAGMENTO', line);
      }
    }

    // ── 3. Dead links ──────────────────────────────────────────────────────────
    if (/clique\s+(aqui|e\s+acesse)|acesse\s+a\s+referência|aprofunde\s+seus\s+conhecimentos/i.test(trimmed)) {
      flag(id, 'LINK MORTO', line);
    }

    // ── 4. Obvious instruction fragments (isolated single words/short phrases) ─
    if (/^(apresentação|lentamente|febre|dor)\.$/.test(trimmed)) {
      flag(id, 'FRAGMENTO ISOLADO', line);
    }
    // Instruction starting with lowercase after a full stop in prev line
    if (i > 0 && /[a-záàâãéíóôõúç]/.test(trimmed[0]) && trimmed.length < 40 && !/^(e\/ou|ou\b|e\b)/i.test(trimmed)) {
      const prev = lines[i - 1].trim();
      if (prev.endsWith('.') || prev.endsWith(',')) {
        // could be a continuation — only flag very short ones
        if (trimmed.length < 25 && !/^\d/.test(trimmed)) {
          flag(id, 'LINHA CURTA APÓS PONTUAÇÃO', `[${i}] "${lines[i-1].trim()}" | "${trimmed}"`);
        }
      }
    }

    // ── 5. Repeated drug-name page headers within same topic ──────────────────
    // Count occurrences of each line that looks like a drug heading
    if (/^[A-ZÁÀÂÃÉÍÓÔÕÚÇ][a-záàâãéíóôõúç]+ (ou|e|\/)\s+[A-ZÁÀÂÃÉÍÓÔÕÚÇ]/.test(trimmed) && trimmed.length < 60) {
      const count = text.split('\n').filter(l => l.trim() === trimmed).length;
      if (count >= 2) {
        flag(id, `CABEÇALHO REPETIDO (${count}x)`, trimmed);
      }
    }

    // ── 6. Dose/instruction text inside what should be a section header ────────
    // e.g. "Uso oral:\nDipirona 500 mg\n" is fine, but "Uso oral: Dipirona 500 mg" is not
    if (/^Uso\s+\w+:\s+\d/.test(trimmed)) {
      flag(id, 'SEÇÃO COM DOSE', line);
    }

    // ── 7. Incomplete sentences — ending with prepositions/conjunctions ────────
    if (/\s+(de|para|em|a|o|e|com|por|na|no|da|do)\s*$/.test(trimmed) && trimmed.length > 20) {
      flag(id, 'FRASE TERMINANDO COM PREPOSIÇÃO', line);
    }

    // ── 8. Lines with stray semicolons where slashes expected (ml;kg etc.) ─────
    if (/\b\w+;\w+\b/.test(trimmed) && !/\b(p\.ex\.|i\.e\.|etc\.)\b/i.test(trimmed)) {
      flag(id, 'PONTO-E-VÍRGULA SUSPEITO', line);
    }

    // ── 9. Malformed dose separators ──────────────────────────────────────────
    if (/\d+\s*[,/]\s*\d+\s*mg\/kg/i.test(trimmed) === false && /\d+\s*;\s*(mg|mL|kg|UI)/i.test(trimmed)) {
      flag(id, 'SEPARADOR DE DOSE MALFORMADO', line);
    }
  }
}

// ── Deduplicate (same id+type+excerpt) ────────────────────────────────────────
const seen = new Set();
const deduped = issues.filter(({ id, type, excerpt }) => {
  const key = `${id}|${type}|${excerpt}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

// ── Print grouped by type ─────────────────────────────────────────────────────
const byType = {};
for (const issue of deduped) {
  (byType[issue.type] = byType[issue.type] || []).push(issue);
}

for (const [type, items] of Object.entries(byType)) {
  console.log(`\n━━ ${type} (${items.length}) ━━`);
  for (const { id, excerpt } of items) {
    console.log(`  [${id.padStart(3)}] ${excerpt}`);
  }
}

console.log(`\n\nTotal: ${deduped.length} ocorrências em ${new Set(deduped.map(i=>i.id)).size} tópicos`);
