// Fix all content errors identified in the full review
// Run: node scripts/fix-content-errors.mjs (from plataforma/ dir)
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

// ── Tema 1: Introdução — remover artefatos de cabeçalho de página ───────────
fix('1',
  '\n\ncrítico\nO manejo',
  '\n\nO manejo',
  'remover "crítico" isolado'
);
fix('1',
  '\n\nEmergência\nNa suspeita de mecanismo de trauma',
  '\n\nNa suspeita de mecanismo de trauma',
  'remover "Emergência" artefato 1'
);
fix('1',
  '\n\nEmergência\nEm pacientes com alteração do nível de',
  '\n\nEm pacientes com alteração do nível de',
  'remover "Emergência" artefato 2'
);

// ── Tema 7: Sepse — ponto-e-vírgula em dose ─────────────────────────────────
fix('7',
  'de 30 ml;kg',
  'de 30 ml/kg',
  'corrigir "30 ml;kg" → "30 ml/kg"'
);

// ── Tema 17: Noradrenalina — substituir por conteúdo correto (só Noradrenalina)
const t16 = content['16'];
const noraOnly = t16.split('\n\n2) Dobutamina')[0];
if (!noraOnly || noraOnly.length < 1000) {
  console.error('  ✗ [17] Falha ao extrair conteúdo de Noradrenalina do tema 16');
} else {
  content['17'] = noraOnly;
  console.log(`  ✓ [17] Conteúdo substituído por apenas Noradrenalina (${noraOnly.length} chars)`);
  changes++;
}

// ── Tema 22: ISR — juntar linha "emergência:" com a anterior ────────────────
fix('22',
  'no cenário de\nemergência:',
  'no cenário de emergência:',
  'juntar "no cenário de emergência:" em uma linha'
);

// ── Tema 24: Mordedura — remover links mortos ────────────────────────────────
fix('24',
  '\nClique e acesse a referência utilizada!\nAprofunde seus conhecimentos (NT MS)!',
  '',
  'remover links mortos ao final'
);

// ── Tema 60: Intolerância à lactose — remover link morto ────────────────────
fix('60',
  'clicando aqui e/ou aqui',
  'nas referências do ebook',
  'substituir link morto por texto'
);

// ── Tema 78: ITU definições — remover link morto ────────────────────────────
fix('78',
  'Para mais informações sobre este novo\nGuideline, clique aqui!',
  'Para mais informações sobre este novo Guideline, consulte a referência indicada.',
  'substituir link morto por texto'
);

// ── Tema 103: Hiponatremia — frase truncada ──────────────────────────────────
fix('103',
  'Em geral, a reposição de sódio será realizada\ne/ou grave (com Na < 120 mEq/L).',
  'Em geral, a reposição de sódio será realizada quando o quadro for sintomático e/ou grave (com Na < 120 mEq/L).',
  'completar frase truncada'
);

// ── Tema 107: Hipofosfatemia — fragmentos sem valor de corte ─────────────────
fix('107',
  'Nos pacientes que estão assintomáticos com\nmg/dL), algumas referências indicam apenas',
  'Nos pacientes que estão assintomáticos com hipofosfatemia leve (P > 1,5 mg/dL), algumas referências indicam apenas',
  'completar fragmento 1 (assintomáticos)'
);
fix('107',
  'Nos pacientes sintomáticos ou com\nmg/dL (varia conforme as referências),',
  'Nos pacientes sintomáticos ou com hipofosfatemia grave (P < 1,5 mg/dL, varia conforme as referências),',
  'completar fragmento 2 (sintomáticos)'
);

// ── Tema 108: Hiperfosfatemia — início corrompido + aspas espúrias ────────────
fix('108',
  'Hiperfosfatemia (P > 2,5 mg/dL)\ncom hipocalcemia sintomática pode ser\ngeralmente se resolve dentro de 6 a 12 horas,',
  'Hiperfosfatemia (P > 4,5 mg/dL)\nA hiperfosfatemia com hipocalcemia sintomática geralmente se resolve dentro de 6 a 12 horas,',
  'corrigir início corrompido e threshold incorreto'
);
fix('108',
  'por efeito de diluição."\n',
  'por efeito de diluição.\n',
  'remover aspas espúrias'
);

// ── Tema 109: Hipocalcemia — início cortado + 7 cabeçalhos repetidos ─────────
fix('109',
  'mmol/L.\nsintomas discretos, podemos realizar a\nreposição de cálcio inicialmente pela via\noral. A reposição EV pode ser necessária caso\nnão haja resposta clínica adequada.',
  'mmol/L.\nEm pacientes assintomáticos ou com sintomas discretos, podemos realizar a reposição de cálcio inicialmente pela via oral. A reposição EV pode ser necessária caso não haja resposta clínica adequada.',
  'completar início cortado'
);
// Remover os 7 cabeçalhos de página repetidos "Cai < 4,65 mg/dL ou < 1,16 mmol/L)"
const caiHeader = '\nCai < 4,65 mg/dL ou < 1,16 mmol/L)\n';
let caiCount = 0;
while (content['109'].includes(caiHeader)) {
  content['109'] = content['109'].replace(caiHeader, '\n');
  caiCount++;
}
if (caiCount > 0) {
  console.log(`  ✓ [109] Removidos ${caiCount} cabeçalhos de página repetidos`);
  changes += caiCount;
} else {
  console.error('  ✗ [109] Cabeçalhos de página não encontrados');
}

// ── Tema 110: Hipercalcemia — palavra faltando ────────────────────────────────
fix('110',
  'classificam o\nassociada em grande número de casos com',
  'classificam o quadro como hipercalcemia grave, associada em grande número de casos com',
  'completar frase com palavra faltando'
);

// ── Tema 114: Prescrição hospitalar — links mortos ───────────────────────────
fix('114',
  '\nClique aqui para mais detalhes!\n',
  '\n',
  'remover "Clique aqui para mais detalhes!"'
);
fix('114',
  '\nClique para acessar a sugestão de leitura\ne aprofundar os conhecimentos.\n',
  '\n',
  'remover "Clique para acessar a sugestão de leitura"'
);
fix('114',
  'e como prescrever adequadamente, clique\naqui e vá diretamente para o capítulo no\nqual este tema é abordado.',
  'e como prescrever adequadamente, consulte o capítulo de Antieméticos.',
  'substituir link morto por texto'
);

// ── Salvar ────────────────────────────────────────────────────────────────────
console.log(`\nTotal de correções: ${changes}`);
writeFileSync(PATH, JSON.stringify(content, null, 2));
console.log('Salvo em prescricoes-content.json');
