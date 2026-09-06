// Batch fix #2 — errors found in systematic audit
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PATH = join(ROOT, 'lib', 'prescricoes-content.json');
const content = JSON.parse(readFileSync(PATH, 'utf8'));

let changes = 0;
function fix(id, from, to, label) {
  if (!content[id].includes(from)) {
    console.error(`  ✗ [${id}] NOT FOUND: ${label}`);
    return;
  }
  content[id] = content[id].replace(from, to);
  console.log(`  ✓ [${id}] ${label}`);
  changes++;
}
function fixAll(id, from, to, label) {
  if (!content[id].includes(from)) {
    console.error(`  ✗ [${id}] NOT FOUND: ${label}`);
    return;
  }
  let count = 0;
  while (content[id].includes(from)) {
    content[id] = content[id].replace(from, to);
    count++;
  }
  console.log(`  ✓ [${id}] ${label} (${count}x)`);
  changes += count;
}

// ── GRUPO A: Seções com conteúdo extra ───────────────────────────────────────

// [44] Laxantes — "Uso oral: diarreia," e instrução partido
fix('44',
  'Uso oral: diarreia,\nLactulose xarope 667 mg/mL\nTomar 15 ml, de 12/12h. Se\ninterromper uso da medicação.',
  'Uso oral:\nLactulose xarope 667 mg/mL\nTomar 15 ml, de 12/12h. Se diarreia, interromper uso da medicação.',
  '"Uso oral: diarreia," + instrução reconstituída'
);

// [103] Hiponatremia — "1ª Etapa: a cada 20-30" + "Uso endovenoso: até 3 vezes" + instrução partido
fix('103',
  '1ª Etapa: a cada 20-30\nUso endovenoso: até 3 vezes\nNaCl 3%\nInfundir 50 a 100 mL, EV,\nminutos, podendo repetir\n(máximo 150 mL ~ 300 mL).',
  '1ª Etapa:\nUso endovenoso:\nNaCl 3%\nInfundir 50 a 100 mL, EV, em 20-30 minutos, podendo repetir até 3 vezes (máximo 150 mL ~ 300 mL).',
  '"1ª Etapa: a cada 20-30" + "Uso endovenoso: até 3 vezes" + instrução reconstituída'
);

// ── GRUPO B: Instruções com quebra de linha no meio ──────────────────────────

// [49] Diverticulite — "caso dor e/ou\nfebre." (×2)
fixAll('49',
  'caso dor e/ou\nfebre.',
  'caso dor e/ou febre.',
  '"caso dor e/ou febre." reunido'
);

// [51] Gastroenterite — "se dor ou\nfebre."
fix('51',
  'se dor ou\nfebre.',
  'se dor ou febre.',
  '"se dor ou febre." reunido'
);

// [59] Gases — "caso gases e/ou\ndistensão abdominal." (×2)
fixAll('59',
  'caso gases e/ou\ndistensão abdominal.',
  'caso gases e/ou distensão abdominal.',
  '"caso gases e/ou distensão abdominal." reunido'
);

// [63] Cefaleia — "via intramuscular\n(dose total de 75 mg), agora." (×2)
fixAll('63',
  'via intramuscular\n(dose total de 75 mg), agora.',
  'via intramuscular (dose total de 75 mg), agora.',
  '"via intramuscular (dose total de 75 mg)" reunido'
);

// ── GRUPO C: Cabeçalhos de página repetidos (artefatos PDF) ─────────────────

// [7] Sepse — "Escolha do antimicrobiano" aparece 10x
fixAll('7',
  '\n\nEscolha do antimicrobiano\n',
  '\n\n',
  'Remover "Escolha do antimicrobiano" repetido (cabeçalho de página)'
);

// [29] Intoxicação por metanol — "Antídotos" em 3 posições redundantes
// Manter nas linhas 51 e 91 (1ª Escolha e 2ª Escolha), remover as intermediárias
fix('29',
  '\n\nAntídotos\n1ª Escolha: Fomepizol (pouco disponível*)\nRecomenda-se dose de 15 mg/kg EV em 30',
  '\n\n1ª Escolha: Fomepizol (pouco disponível*)\nRecomenda-se dose de 15 mg/kg EV em 30',
  'Remover "Antídotos" duplicado (2ª ocorrência — mesma 1ª Escolha)'
);
fix('29',
  '\n\nAntídotos\nDetalhes sobre o Fomepizol:',
  '\n\nDetalhes sobre o Fomepizol:',
  'Remover "Antídotos" cabeçalho antes de Detalhes Fomepizol'
);
fix('29',
  '\n\nAntídotos\n2ª Escolha: Etanol\nPaciente de 70 kg:',
  '\n\n2ª Escolha: Etanol\nPaciente de 70 kg:',
  'Remover "Antídotos" duplicado (2ª ocorrência — mesma 2ª Escolha)'
);

// [74] Gripe/Influenza — "Oseltamivir" repetido 3x (manter 1ª ocorrência)
fix('74',
  '\n\nOseltamivir\nIndicações segundo o Protocolo de\nTratamento de Influenza 2017 do Ministério\nda Saúde:\nTranstornos neurológicos',
  '\n\nIndicações segundo o Protocolo de\nTratamento de Influenza 2017 do Ministério\nda Saúde:\nTranstornos neurológicos',
  'Remover "Oseltamivir" duplicado (2ª ocorrência)'
);
fix('74',
  '\n\nOseltamivir\nIndicações segundo o Protocolo de\nTratamento de Influenza 2017 do Ministério\nda Saúde:\nPneumopatias',
  '\n\nIndicações segundo o Protocolo de\nTratamento de Influenza 2017 do Ministério\nda Saúde:\nPneumopatias',
  'Remover "Oseltamivir" duplicado (3ª ocorrência)'
);
fix('74',
  '\n\nOseltamivir\nDetalhe: Iniciar o tratamento',
  '\n\nDetalhe: Iniciar o tratamento',
  'Remover "Oseltamivir" cabeçalho antes de Detalhe'
);

// [102] Hipercalemia — "Medidas para shift in" duplicado (linha 47 = repetição da linha 32)
fix('102',
  'intracelular do potássio)\nGlicoinsulina/solução polarizante\nUso endovenoso:\n\nSoro Glicosado 500 mL (SG 10%)\n',
  'intracelular do potássio)\nGlicoinsulina/solução polarizante\nUso endovenoso:\nSoro Glicosado 500 mL (SG 10%)\n',
  'Verificação linha 47 [102] — remover duplicata de Medidas shift in'
);
// Safer: just remove the repeated blank section
fix('102',
  '\n\nMedidas para “shift in” (deslocamento\nintracelular do potássio)\nGlicoinsulina/solução polarizante\nUso endovenoso:\n\nSoro Glicosado',
  '\n\nSoro Glicosado',
  'Remover "Medidas shift in + Glicoinsulina" duplicado (2ª ocorrência)'
);

// ── Salvar ───────────────────────────────────────────────────────────────────
console.log(`\nTotal: ${changes} correção(ões)`);
writeFileSync(PATH, JSON.stringify(content, null, 2));
console.log('Salvo.');
