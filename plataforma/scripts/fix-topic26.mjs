// Fix topic 26 (Analgésicos): PDF extraction artifacts and dosing errors
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PATH = join(ROOT, 'lib', 'prescricoes-content.json');
const content = JSON.parse(readFileSync(PATH, 'utf8'));

let changes = 0;
function fix(from, to, label) {
  if (!content['26'].includes(from)) {
    console.error(`  ✗ NOT FOUND: ${label}`);
    return;
  }
  content['26'] = content['26'].replace(from, to);
  console.log(`  ✓ ${label}`);
  changes++;
}

// ── Drug heading artifacts (PDF page headers) ────────────────────────────────

// Keep first "Dipirona ou Metamizol" but make it a subtitle
fix(
  'Dipirona ou Metamizol\nDose e posologia',
  'Dipirona ou Metamizol:\nDose e posologia',
  'Converter "Dipirona ou Metamizol" inicial em subtítulo'
);
// Remove 2nd occurrence (before Detalhes)
fix(
  '\n\nDipirona ou Metamizol\nDetalhes:',
  '\n\nDetalhes:',
  'Remover "Dipirona ou Metamizol" repetido (antes de Detalhes)'
);
// Remove 3rd occurrence (before Uso endovenoso)
fix(
  '\n\nDipirona ou Metamizol\nUso endovenoso:',
  '\n\nUso endovenoso:',
  'Remover "Dipirona ou Metamizol" repetido (antes de Uso endovenoso)'
);

// Keep first "Paracetamol ou Acetaminofeno" but make it a subtitle
fix(
  'Paracetamol ou Acetaminofeno\nDose e posologia',
  'Paracetamol ou Acetaminofeno:\nDose e posologia',
  'Converter "Paracetamol ou Acetaminofeno" inicial em subtítulo'
);
// Remove 2nd occurrence (before Detalhes)
fix(
  '\n\nParacetamol ou Acetaminofeno\nDetalhes:',
  '\n\nDetalhes:',
  'Remover "Paracetamol ou Acetaminofeno" repetido (antes de Detalhes)'
);

// ── Dosing errors ─────────────────────────────────────────────────────────────

// "Uso oral: caso" + "Dipirona 500 mg e/ou" + broken instruction
fix(
  'Uso oral: caso\nDipirona 500 mg e/ou\nTomar 01 a 02 comprimidos, de 6/6h,\ndor e/ou febre.',
  'Uso oral:\nDipirona 500 mg\nTomar 01 a 02 comprimidos, de 6/6h, caso dor e/ou febre.',
  'Corrigir "USO ORAL: CASO" + "Dipirona 500 mg e/ou" + instrução incompleta'
);

// Dipirona solução oral — broken "caso dor febre"
fix(
  'Tomar 10 a 20 mL, de 6/6h, caso dor\nfebre.',
  'Tomar 10 a 20 mL, de 6/6h, caso dor e/ou febre.',
  'Corrigir "caso dor febre" → "caso dor e/ou febre"'
);

// ── Morfina IM: seção + medicamento + instrução embaralhados ─────────────────
fix(
  'Uso intramuscular: 1 mg/mL -\nSulfato de Morfina injetável 01 ampola\nampola 2mL para essa\nAdministrar o conteúdo de\nlentamente, via IM.\nNão é necessário diluição\napresentação.',
  'Uso intramuscular:\nSulfato de Morfina injetável 1 mg/mL - ampola 2mL\nAdministrar o conteúdo de 01 ampola lentamente, via IM. Não é necessário diluição para essa apresentação.',
  'Corrigir Morfina IM — seção + nome + instrução embaralhados'
);

// ── Save ──────────────────────────────────────────────────────────────────────
console.log(`\nTotal: ${changes} correção(ões)`);
writeFileSync(PATH, JSON.stringify(content, null, 2));
console.log('Salvo.');
