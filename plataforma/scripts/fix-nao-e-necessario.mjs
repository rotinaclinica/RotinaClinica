// Fix "Não é necessário reconstituição" pattern + topic 7 Ringer/SOFA errors
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PATH = join(ROOT, 'lib', 'prescricoes-content.json');
const content = JSON.parse(readFileSync(PATH, 'utf8'));

let n = 0;
function fix(id, from, to) {
  if (!content[id].includes(from)) {
    console.error(`  ✗ [${id}] NOT FOUND: ${from.slice(0,60).replace(/\n/g,'↵')}`);
    return;
  }
  content[id] = content[id].split(from).join(to);
  console.log(`  ✓ [${id}] ${from.slice(0,55).replace(/\n/g,'↵')}`);
  n++;
}

// ── Tópico 7 — erros novos ─────────────────────────────────────────────────

// SF 0,9% ou Ringer lactato: remover "-----30 ml/kg", mover dose para instrução,
// juntar nota quebrada, remover "Pacote da 1ª hora" repetido (cabeçalho PDF)
fix('7',
  'SF 0,9% ou Ringer lactato -----30 ml/kg\nInfundir em até 03 horas.\nAtentar-se ao risco de hipervolemia e\ncongestão pulmonar.\n\nPacote da 1ª hora\n3)',
  'SF 0,9% ou Ringer lactato\nInfundir 30 ml/kg em até 03 horas. Atentar-se ao risco de hipervolemia e congestão pulmonar.\n\n3)'
);

// "2) Coleta de exames... SOFA 2:" — juntar linha e remover o "2" espúrio
fix('7',
  '2) Coleta de exames laboratoriais\nfundamentais na análise do SOFA 2:',
  '2) Coleta de exames laboratoriais fundamentais na análise do SOFA:'
);

// ── Padrão "Não é necessário reconstituição" — reordenar para começar com verbo ─

// [7] Linezolida
fix('7',
  'Linezolida 600mg injetável 2mg/mL\nNão é necessário reconstituição. Infundir em\n60 minutos, de 12/12h.',
  'Linezolida 600mg injetável 2mg/mL\nInfundir em 60 minutos, de 12/12h. Não é necessário reconstituição.'
);

// [7] Metronidazol — remover "- Bolsa" do nome + reordenar instrução
fix('7',
  'Metronidazol injetável 5mg/mL - Bolsa\nNão é necessário reconstituição. Infundir em\n60 minutos, de 8/8h.',
  'Metronidazol injetável 5mg/mL\nInfundir em 60 minutos, de 8/8h. Não é necessário reconstituição.'
);

// ── [25] Pneumonia ─────────────────────────────────────────────────────────

// Linezolida
fix('25',
  'Linezolida 600mg injetável 2mg/mL\nNão é necessário reconstituição. Infundir em\n60 minutos, de 12/12h.',
  'Linezolida 600mg injetável 2mg/mL\nInfundir em 60 minutos, de 12/12h. Não é necessário reconstituição.'
);

// Vancomicina (Não é necessário reconstituição. Diluir em 100 a 200 mL)
fix('25',
  'Não é necessário reconstituição. Diluir em\n100 a 200 mL de SF 0,9% e infundir em 60\nminutos, uma vez ao dia.',
  'Diluir em 100 a 200 mL de SF 0,9% e infundir em 60 minutos, uma vez ao dia. Não é necessário reconstituição.'
);

// Clindamicina
fix('25',
  'Clindamicina injetável 600mg F/A\nNão é necessário reconstituição. Diluir em\n100 mL de SF 0,9% e infundir em 60 minutos,\nde 8/8h.',
  'Clindamicina injetável 600mg F/A\nDiluir em 100 mL de SF 0,9% e infundir em 60 minutos, de 8/8h. Não é necessário reconstituição.'
);

// Ciprofloxacino
fix('25',
  'Ciprofloxacino 400mg Solução injetável\nNão é necessário reconstituição. Infundir em\n60 minutos, de 12/12h.',
  'Ciprofloxacino 400mg Solução injetável\nInfundir em 60 minutos, de 12/12h. Não é necessário reconstituição.'
);

// Levofloxacino + "Frasco de 100mL" — juntar ao nome correto e reordenar
fix('25',
  'Levofloxacino 500mg injetável 5mg/mL -\nFrasco de 100mL\nNão é necessário reconstituição. Infundir em\n60 minutos, uma vez ao dia.',
  'Levofloxacino 500mg injetável 5mg/mL\nInfundir em 60 minutos, uma vez ao dia. Não é necessário reconstituição (dose habitual: 750 mg = 1,5 frascos de 100mL).'
);

// Metronidazol — remover "- Bolsa" + reordenar
fix('25',
  'Metronidazol injetável 5mg/mL - Bolsa\nNão é necessário reconstituição. Infundir em\n60 minutos, de 8/8h.',
  'Metronidazol injetável 5mg/mL\nInfundir em 60 minutos, de 8/8h. Não é necessário reconstituição.'
);

// ── [31] Infecção de pele e partes moles ───────────────────────────────────

// Linezolida
fix('31',
  'Linezolida 600mg injetável 2mg/mL\nNão é necessário reconstituição. Infundir em\n60 minutos, de 12/12h, por 7 a 14 dias.',
  'Linezolida 600mg injetável 2mg/mL\nInfundir em 60 minutos, de 12/12h, por 7 a 14 dias. Não é necessário reconstituição.'
);

// Clindamicina
fix('31',
  'Clindamicina injetável 600mg F/A\nNão é necessário reconstituição. Diluir em\n100 mL de SF 0,9% e infundir em 60 minutos,\nde 8/8h por 7 a 14 dias.',
  'Clindamicina injetável 600mg F/A\nDiluir em 100 mL de SF 0,9% e infundir em 60 minutos, de 8/8h, por 7 a 14 dias. Não é necessário reconstituição.'
);

// ── [50] ITU complicada ────────────────────────────────────────────────────

fix('50',
  'Ciprofloxacino 400 mg/200 ml\nNão é necessário reconstituição. Infundir em\n60 minutos, de 12/12h, por 10 a 14 dias.',
  'Ciprofloxacino 400 mg/200 ml\nInfundir em 60 minutos, de 12/12h, por 10 a 14 dias. Não é necessário reconstituição.'
);

fix('50',
  'Metronidazol 500 mg/100 ml\nNão é necessário reconstituição. Infundir em\n60 minutos, de 8/8h, por 10 a 14 dias',
  'Metronidazol 500 mg/100 ml\nInfundir em 60 minutos, de 8/8h, por 10 a 14 dias. Não é necessário reconstituição.'
);

// ── [52] Infecção abdominal ────────────────────────────────────────────────

fix('52',
  'Ciprofloxacino 400 mg/200 ml\nNão é necessário reconstituição. Infundir 01\nbolsa, EV, em 60 minutos, de 12/12h, por 07\ndias.',
  'Ciprofloxacino 400 mg/200 ml\nInfundir 01 bolsa, EV, em 60 minutos, de 12/12h, por 07 dias. Não é necessário reconstituição.'
);

fix('52',
  'Metronidazol 500 mg/100 ml\nNão é necessário reconstituição. Infundir 01\nbolsa, EV, em 60 minutos, de 8/8h, por 07\ndias.',
  'Metronidazol 500 mg/100 ml\nInfundir 01 bolsa, EV, em 60 minutos, de 8/8h, por 07 dias. Não é necessário reconstituição.'
);

// ── [69] PAC grave ─────────────────────────────────────────────────────────

fix('69',
  'Levofloxacino 500mg injetável 5mg/mL -\nFrasco de 100mL\nNão é necessário reconstituição. Infundir em\n60 minutos, uma vez ao dia.',
  'Levofloxacino 500mg injetável 5mg/mL\nInfundir em 60 minutos, uma vez ao dia. Não é necessário reconstituição (dose habitual: 750 mg = 1,5 frascos de 100mL).'
);

// ── [70] DPOC exacerbado ───────────────────────────────────────────────────

fix('70',
  'Levofloxacino 500mg injetável 5mg/mL -\nFrasco de 100mL\nNão é necessário reconstituição. Infundir em\n60 minutos, uma vez ao dia.',
  'Levofloxacino 500mg injetável 5mg/mL\nInfundir em 60 minutos, uma vez ao dia. Não é necessário reconstituição (dose habitual: 750 mg = 1,5 frascos de 100mL).'
);

// ── Salvar ─────────────────────────────────────────────────────────────────
console.log(`\n${n} correção(ões) aplicada(s).`);
writeFileSync(PATH, JSON.stringify(content, null, 2));
console.log('Salvo.');
