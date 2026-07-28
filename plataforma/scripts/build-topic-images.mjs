// Build topic image PNGs from raw pixel data — uses the VERIFIED page→topic mapping
// Based on reading actual page text content
// Run: node scripts/build-topic-images.mjs (from plataforma/ dir)

import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import sharp from '../node_modules/sharp/lib/index.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RAW = join(ROOT, 'public', 'prescricoes-images');
const OUT = join(ROOT, 'public', 'prescricoes-images', 'topic');

// Verified mapping: PDF page → topic ID (from reading actual page text content)
// Skip: pages 7,8 = author bios; 13 = marketing QR; 204 = multi-topic section header
const PAGE_TO_TOPIC = {
  94:  "20",  // Ventilação mecânica invasiva - PCV table
  95:  "20",  // Ventilação mecânica invasiva - VCV table
  167: "30",  // Anticoagulantes - Score de Padua
  181: "31",  // Celulite e Erisipela
  184: "32",  // Escabiose - Túnel Escabiótico
  187: "33",  // Tinea corporis
  196: "37",  // ABCDE do melanoma - Assimetria
  197: "37",  // ABCDE do melanoma - Bordas
  198: "37",  // ABCDE do melanoma - Cor
  199: "37",  // ABCDE do melanoma - Diâmetro
  200: "37",  // ABCDE do melanoma - Evolução
  305: "70",  // Pneumonia comunitária
  306: "70",  // Pneumonia comunitária
  307: "70",  // Pneumonia comunitária
  331: "78",  // ITU definições - IDSA 2025
  392: "100", // Tontura e vertigem
  403: "102", // Hipercalemia - ECG changes
  456: "112", // Delirium e agitação psicomotora
  472: "114", // Prescrição no paciente internado
  476: "114", // Prescrição no paciente internado
  480: "114", // Prescrição no paciente internado
  488: "114", // Prescrição no paciente internado
  489: "114", // Prescrição no paciente internado
};

// Clean up old incorrectly mapped output if it exists
if (existsSync(OUT)) {
  rmSync(OUT, { recursive: true });
  console.log('Cleaned old topic/ output dir');
}

// Per-topic image counter to generate unique filenames
const topicCounter = {};

const topicImages = {}; // topicId → ['/prescricoes-images/topic/{id}/img_{n}.png', ...]

for (const [pageStr, topicId] of Object.entries(PAGE_TO_TOPIC)) {
  const pageNum = Number(pageStr);
  const pageDir = join(RAW, String(pageNum));
  if (!existsSync(pageDir)) {
    console.log(`  Page ${pageNum}: raw dir missing, skip`);
    continue;
  }

  const topicOutDir = join(OUT, topicId);
  mkdirSync(topicOutDir, { recursive: true });

  const metaFiles = readdirSync(pageDir).filter(f => f.endsWith('.meta.json')).sort();

  for (const metaFile of metaFiles) {
    const meta = JSON.parse(readFileSync(join(pageDir, metaFile), 'utf8'));
    const { width, height, kind } = meta;

    // Skip standard ebook elements: header banner (1710x257) and QR sidebar (338x636)
    if ((width === 1710 && height === 257) || (width === 338 && height === 636)) continue;

    const rawFile = metaFile.replace('.meta.json', '.raw');
    const rawPath = join(pageDir, rawFile);
    if (!existsSync(rawPath)) continue;

    if (!topicCounter[topicId]) topicCounter[topicId] = 0;
    const n = topicCounter[topicId]++;
    const outFilename = `img_${n}.png`;
    const outPath = join(topicOutDir, outFilename);

    const channels = kind === 1 ? 1 : kind === 2 ? 3 : 4;
    const rawData = readFileSync(rawPath);

    try {
      await sharp(rawData, { raw: { width, height, channels } }).png().toFile(outPath);
      const webPath = `/prescricoes-images/topic/${topicId}/${outFilename}`;
      if (!topicImages[topicId]) topicImages[topicId] = [];
      topicImages[topicId].push(webPath);
      console.log(`  Page ${pageNum} → topic ${topicId}: ${outFilename} (${width}x${height})`);
    } catch (e) {
      console.log(`  Page ${pageNum}: FAILED ${rawFile}: ${e.message}`);
    }
  }
}

console.log('\n=== Final topic → images ===');
console.log(JSON.stringify(topicImages, null, 2));

writeFileSync(join(RAW, '_topic-images.json'), JSON.stringify(topicImages, null, 2));
console.log('\nSaved _topic-images.json');
