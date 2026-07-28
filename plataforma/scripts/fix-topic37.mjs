// Fix topic 37 (ABCDE do melanoma): insert missing img_3 and img_4 between C/D and D/E
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT_PATH = join(ROOT, 'lib', 'prescricoes-content.json');

const content = JSON.parse(readFileSync(CONTENT_PATH, 'utf8'));

const before = content['37'];

content['37'] = content['37']
  .replace(
    '\n\nD: diâmetro',
    '\n\n[IMAGE:/prescricoes-images/topic/37/img_3.png]\n\nD: diâmetro'
  )
  .replace(
    '\n\nE: evolução',
    '\n\n[IMAGE:/prescricoes-images/topic/37/img_4.png]\n\nE: evolução'
  );

const after = content['37'];
if (before === after) {
  console.error('ERROR: no replacements made');
  process.exit(1);
}

console.log('Updated topic 37. Result:');
console.log(content['37']);

writeFileSync(CONTENT_PATH, JSON.stringify(content, null, 2));
console.log('\nSaved');
