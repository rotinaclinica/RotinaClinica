// Inject [IMAGE:...] markers into prescricoes-content.json
// Run: node scripts/inject-images.mjs
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT_PATH = join(ROOT, 'lib', 'prescricoes-content.json');

const content = JSON.parse(readFileSync(CONTENT_PATH, 'utf8'));

function img(topicId, n) {
  return `[IMAGE:/prescricoes-images/topic/${topicId}/img_${n}.png]`;
}

// ── Topic 20: Ventilação mecânica invasiva ──────────────────────────────────
// PCV table after "modo PCV:\n\n", VCV table at end
content['20'] = content['20']
  .replace(
    'mecânica em modo PCV:\n\n',
    `mecânica em modo PCV:\n\n${img(20,0)}\n\n`
  )
  .replace(
    /mecânica em modo VCV:\n?$/,
    `mecânica em modo VCV:\n\n${img(20,1)}`
  );

// ── Topic 30: Anticoagulantes ───────────────────────────────────────────────
// Score de Padua image right after the first paragraph
content['30'] = content['30']
  .replace(
    'houver contraindicação).\n\nContraindicações',
    `houver contraindicação).\n\n${img(30,0)}\n\nContraindicações`
  );

// ── Topic 31: Celulite e Erisipela ──────────────────────────────────────────
// Remove the extracted caption text and replace with image markers
content['31'] = content['31']
  .replace(
    /\nErisipela Celulite\nbolhosa \(CREMESP 2013\)\n\(Acervo\npróprio\ndo Rotina\nClínica\)/,
    `\n\n${img(31,0)}\n${img(31,1)}`
  );

// ── Topic 32: Escabiose ─────────────────────────────────────────────────────
content['32'] = content['32']
  .replace(
    /\n\nTúnel\nEscabiotico\nImagens retiradas de:.*$/s,
    `\n\n${img(32,0)}\n${img(32,1)}`
  );

// ── Topic 33: Tinea corporis ────────────────────────────────────────────────
content['33'] = content['33']
  .replace(
    /\n\nImagens retiradas de: Dermatophyte \(tinea\)\ninfections - UpToDate/,
    `\n\n${img(33,0)}\n${img(33,1)}`
  );

// ── Topic 37: ABCDE do melanoma ─────────────────────────────────────────────
// Insert images after each letter section
content['37'] = content['37']
  // After A section (before B)
  .replace(
    'malignidade.\n\nB: bordas',
    `malignidade.\n\n${img(37,0)}\n${img(37,1)}\n\nB: bordas`
  )
  // After B section (before C)
  .replace(
    'malignidade.\n\nC: cor',
    `malignidade.\n\n${img(37,2)}\n\nC: cor`
  )
  // After C section (before D) — match on paragraph break before D:
  .replace(
    '\n\nD: diâmetro',
    `\n\n${img(37,3)}\n\nD: diâmetro`
  )
  // After D section (before E) — match on paragraph break before E:
  .replace(
    '\n\nE: evolução',
    `\n\n${img(37,4)}\n\nE: evolução`
  )
  // Replace final citation with image
  .replace(
    /\nImagem retirada de: Skin Cancer, Melanoma -\nColumbia University$/,
    `\n\n${img(37,5)}`
  );

// ── Topic 70: Pneumonia comunitária ────────────────────────────────────────
content['70'] += `\n\n${img(70,0)}\n${img(70,1)}\n${img(70,2)}`;

// ── Topic 78: ITU definições ────────────────────────────────────────────────
content['78'] += `\n\n${img(78,0)}`;

// ── Topic 100: Tontura e vertigem ───────────────────────────────────────────
content['100'] += `\n\n${img(100,0)}`;

// ── Topic 102: Hipercalemia ─────────────────────────────────────────────────
content['102'] += `\n\n${img(102,0)}`;

// ── Topic 112: Delirium e agitação psicomotora ──────────────────────────────
content['112'] += `\n\n${img(112,0)}`;

// ── Topic 114: Prescrição no paciente internado ─────────────────────────────
content['114'] += `\n\n${img(114,0)}\n${img(114,1)}\n${img(114,2)}\n${img(114,3)}\n${img(114,4)}\n${img(114,5)}\n${img(114,6)}`;

// Verify a few
console.log('Topic 20 last 300:', content['20'].slice(-300));
console.log('\nTopic 37 sample (first 600):', content['37'].slice(0, 600));

writeFileSync(CONTENT_PATH, JSON.stringify(content, null, 2));
console.log('\nUpdated prescricoes-content.json');
