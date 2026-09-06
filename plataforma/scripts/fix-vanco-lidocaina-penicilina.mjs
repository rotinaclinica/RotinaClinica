import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PATH = join(ROOT, 'lib', 'prescricoes-content.json');
const content = JSON.parse(readFileSync(PATH, 'utf8'));

let n = 0;
function fix(id, from, to) {
  if (!content[id].includes(from)) {
    console.error(`  ✗ [${id}] NOT FOUND: ${from.slice(0,65).replace(/\n/g,'↵')}`);
    return;
  }
  content[id] = content[id].split(from).join(to);
  console.log(`  ✓ [${id}] ${from.slice(0,60).replace(/\n/g,'↵')}`);
  n++;
}

// ── Vancomicina oral para C. difficile ────────────────────────────────────
// Parser classifica "500 mg de vancomicina..." e "(125 mg)" como drug cards
// porque contêm "mg" e não iniciam com minúscula.
// Fix: unir drug name e toda a instrução em linhas lógicas únicas.

// [25] com "(para infecções por Clostridium Difficile)"
fix('25',
  'Vancomicina 500 mg F/A (para infecções\npor Clostridium Difficile)\nDiluir o conteúdo da ampola em 10 mL de\nágua destilada. Solução final contém 10 ml e\n500 mg de vancomicina. Nos pacientes com\ndoença leve a moderada, administrar 2,5 mL\n(125 mg), VO (ou por SNE), de 6/6h, por 10\ndias.',
  'Vancomicina 500 mg F/A (para infecções por Clostridium Difficile)\nDiluir o conteúdo da ampola em 10 mL de água destilada. Solução final: 10 mL = 500 mg. Dose leve a moderada: 2,5 mL (125 mg), VO (ou por SNE), de 6/6h, por 10 dias.'
);

// [58] versão sem subtítulo + com dose fulminante
fix('58',
  'Vancomicina 500 mg F/A\nDiluir o conteúdo da ampola em 10 mL de\nágua destilada. Solução final contém 10 ml e\n500 mg de vancomicina. Nos pacientes com\ndoença leve a moderada, administrar 2,5 mL\n(125 mg), VO (ou por SNE), de 6/6h, por 10\ndias.\nNos pacientes com doença fulminante,\nadministrar 10 mL (500 mg), VO (ou por SNE),\nde 6/6h, por 10 dias.',
  'Vancomicina 500 mg F/A\nDiluir o conteúdo da ampola em 10 mL de água destilada. Solução final: 10 mL = 500 mg. Dose leve a moderada: 2,5 mL (125 mg), VO (ou por SNE), de 6/6h, por 10 dias. Dose fulminante: 10 mL (500 mg), VO (ou por SNE), de 6/6h, por 10 dias.'
);

// ── Lidocaína 1% — diluente, não medicamento ─────────────────────────────
// "Reconstituir em X mL de AD ou\nLidocaína 1%..." → parser abre nova unit
// Fix: unir na mesma linha da instrução Reconstituir

// [25] vasoconstrictor (com duplo c — artefato do PDF)
fix('25',
  'Reconstituir em 2,9 ou 3,5 mL de AD ou\nLidocaína 1% sem vasoconstrictor.\nAdministrar via IM profunda, uma vez ao dia.',
  'Reconstituir em 2,9 ou 3,5 mL de AD ou Lidocaína 1% sem vasoconstritor. Administrar via IM profunda, uma vez ao dia.'
);

// [86] vasoconstritor
fix('86',
  'Reconstituir em 2,9 ou 3,5 mL de AD ou\nLidocaína 1% sem vasoconstritor. Administrar\n0,5 (meia) ampola, via IM.',
  'Reconstituir em 2,9 ou 3,5 mL de AD ou Lidocaína 1% sem vasoconstritor. Administrar 0,5 (meia) ampola, via IM.'
);

// [89]
fix('89',
  'Reconstituir em 2,9 ou 3,5 mL de AD ou\nLidocaína 1% sem vasoconstritor. Administrar\n0,5 (meia) ampola, via IM.',
  'Reconstituir em 2,9 ou 3,5 mL de AD ou Lidocaína 1% sem vasoconstritor. Administrar 0,5 (meia) ampola, via IM.'
);

// [93]
fix('93',
  'Reconstituir em 2,9 ou 3,5 mL de AD ou\nLidocaína 1% sem vasoconstritor. Administrar\n0,5 (meia) ampola, via IM.',
  'Reconstituir em 2,9 ou 3,5 mL de AD ou Lidocaína 1% sem vasoconstritor. Administrar 0,5 (meia) ampola, via IM.'
);

// ── Penicilina G Benzatina — nome partido, sem unidade na 1ª linha ────────
// "Penicilina G Benzatina injetável - 1.200.000\nUI/4mL..." → 1ª linha não tem
// unidade → isDrug = false → não vira drug card. Fix: juntar na mesma linha.
// Também reorganizar instrução para começar com verbo (Administrar).

// [25] dose única por glúteo
fix('25',
  'Penicilina G Benzatina injetável - 1.200.000\nUI/4mL (frasco 4mL - suspensão injetável)\nExistem apresentações prontas para uso,\nsem necessidade de reconstituição. Outras\npodem ser reconstituídas em 3,2 mL do\ndiluente próprio (água para injeção). O\nvolume final é de 4 mL. Administrar via IM\nprofunda (máx. de 1 dose por glúteo).',
  'Penicilina G Benzatina 1.200.000 UI/4mL\nAdministrar via IM profunda (máx. 1 dose por glúteo). Existem apresentações prontas para uso; outras podem ser reconstituídas em 3,2 mL do diluente próprio (água para injeção), volume final de 4 mL.'
);

// [85] e [93] — 01 ampola em cada glúteo (dose 2.400.000 UI)
const penicilinaDose2 = 'Penicilina G Benzatina injetável - 1.200.000\nUI/4mL (frasco 4mL - suspensão injetável)\nExistem apresentações prontas para uso,\nsem necessidade de reconstituição. Outras\npodem ser reconstituídas em 3,2 mL do\ndiluente próprio (água para injeção). O\nvolume final é de 4 mL. Administrar via IM\nprofunda, 01 ampola em cada glúteo.';
const penicilinaDose2Fix = 'Penicilina G Benzatina 1.200.000 UI/4mL\nAdministrar via IM profunda, 01 ampola em cada glúteo. Existem apresentações prontas para uso; outras podem ser reconstituídas em 3,2 mL do diluente próprio (água para injeção), volume final de 4 mL.';
fix('85', penicilinaDose2, penicilinaDose2Fix);
fix('93', penicilinaDose2, penicilinaDose2Fix);

console.log(`\n${n} correção(ões) aplicada(s).`);
writeFileSync(PATH, JSON.stringify(content, null, 2));
console.log('Salvo.');
