import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PATH = join(ROOT, 'lib', 'prescricoes-content.json');
const content = JSON.parse(readFileSync(PATH, 'utf8'));

let n = 0;
// Single replacement (no while loop — replacement must not contain the search string)
function fix(from, to) {
  if (!content['7'].includes(from)) { console.error('NOT FOUND: ' + from.slice(0,60)); return; }
  content['7'] = content['7'].split(from).join(to);
  console.log('  ✓ ' + from.slice(0,50));
  n++;
}

// Foco lines → add ':' to become subtitles
// Note: use split+join so we don't re-match the replacement
fix('Foco cutâneo - comunitária\n', 'Foco cutâneo - comunitária:\n');
fix('Foco pulmonar - comunitária\n', 'Foco pulmonar - comunitária:\n');
fix('Foco urinário - comunitária\n', 'Foco urinário - comunitária:\n');
fix('Foco abdominal - comunitária\n', 'Foco abdominal - comunitária:\n');
fix('Foco sistema nervoso central (meningite\naguda)', 'Foco sistema nervoso central (meningite aguda):');
fix('Foco indeterminado para paciente\nimunossuprimido grave ou instável', 'Foco indeterminado para paciente imunossuprimido grave ou instável:');

// Levofloxacino — restructure drug name + instruction
fix(
  'Levofloxacino 500mg injetável 5mg/mL -\nFrasco de 100mL (dose habitual de 750 mg,\nisto é, 1,5 frasco)\nNão é necessário reconstituição. Infundir em\n60 minutos, uma vez ao dia.',
  'Levofloxacino 500mg injetável 5mg/mL\nInfundir em 60 minutos, uma vez ao dia. Não é necessário reconstituição (dose habitual: 750 mg = 1,5 frascos de 100mL).'
);

console.log(`\n${n} correções aplicadas.`);
writeFileSync(PATH, JSON.stringify(content, null, 2));
console.log('Salvo.');
