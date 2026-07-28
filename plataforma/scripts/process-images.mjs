// Full image pipeline:
// 1. Extract page text to map PDF pages → topic IDs
// 2. Convert clinical raw images → PNG using sharp
// 3. Output mapping JSON + copy PNGs to public/prescricoes-images/{topicId}/
//
// Run from plataforma/ dir: node scripts/process-images.mjs

import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import sharp from '../node_modules/sharp/lib/index.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PDF  = join(ROOT, 'public', 'ebook', 'Guia de prescrições Rotina Clínica (1).pdf');
const RAW  = join(ROOT, 'public', 'prescricoes-images');
const OUT  = join(ROOT, 'public', 'prescricoes-images');

// ── Topic titles from prescricoes-meta.ts ────────────────────────────────────
const TOPICS = [
  { id: "1",   titulo: "Introdução à emergência" },
  { id: "2",   titulo: "Anafilaxia" },
  { id: "3",   titulo: "Cetoacidose diabética" },
  { id: "4",   titulo: "Hipoglicemia" },
  { id: "5",   titulo: "Teste de estresse com furosemida" },
  { id: "6",   titulo: "Queimaduras" },
  { id: "7",   titulo: "Sepse" },
  { id: "8",   titulo: "DPOC exacerbado" },
  { id: "9",   titulo: "Hemorragia digestiva alta" },
  { id: "10",  titulo: "Crise convulsiva" },
  { id: "11",  titulo: "Síndrome coronariana aguda" },
  { id: "12",  titulo: "Edema agudo de pulmão" },
  { id: "13",  titulo: "Fibrilação atrial" },
  { id: "14",  titulo: "Taquicardia supraventricular paroxística" },
  { id: "15",  titulo: "Torsades de Pointes" },
  { id: "16",  titulo: "Drogas vasoativas" },
  { id: "17",  titulo: "Noradrenalina" },
  { id: "18",  titulo: "Dobutamina" },
  { id: "19",  titulo: "Vasopressina" },
  { id: "20",  titulo: "Ventilação mecânica invasiva" },
  { id: "21",  titulo: "Dengue grave (grupos C e D)" },
  { id: "22",  titulo: "Intubação de sequência rápida" },
  { id: "23",  titulo: "Estridor laríngeo" },
  { id: "24",  titulo: "Mordedura" },
  { id: "25",  titulo: "Antimicrobianos" },
  { id: "26",  titulo: "Analgésicos" },
  { id: "27",  titulo: "Intoxicação por opioides e benzodiazepínicos" },
  { id: "28",  titulo: "Insônia" },
  { id: "29",  titulo: "Intoxicação por metanol" },
  { id: "30",  titulo: "Anticoagulantes" },
  { id: "31",  titulo: "Celulite e Erisipela" },
  { id: "32",  titulo: "Escabiose" },
  { id: "33",  titulo: "Tinea corporis" },
  { id: "34",  titulo: "Urticária" },
  { id: "35",  titulo: "Furunculose" },
  { id: "36",  titulo: "Furunculose de repetição" },
  { id: "37",  titulo: "Dermatite de contato" },
  { id: "38",  titulo: "Onicomicose" },
  { id: "39",  titulo: "Acne" },
  { id: "40",  titulo: "Rosácea" },
  { id: "41",  titulo: "Psoríase" },
  { id: "42",  titulo: "Dermatite atópica" },
  { id: "43",  titulo: "Herpes zoster" },
  { id: "44",  titulo: "Herpes simples" },
  { id: "45",  titulo: "Molusco contagioso" },
  { id: "46",  titulo: "Pediculose" },
  { id: "47",  titulo: "Picada de inseto" },
  { id: "48",  titulo: "Impetigo" },
  { id: "49",  titulo: "Varicela" },
  { id: "50",  titulo: "Hanseníase" },
  { id: "51",  titulo: "Condiloma acuminado" },
  { id: "52",  titulo: "Sífilis" },
  { id: "53",  titulo: "Gonorreia" },
  { id: "54",  titulo: "Clamídia" },
  { id: "55",  titulo: "Tricomoníase" },
  { id: "56",  titulo: "Candidíase vulvovaginal" },
  { id: "57",  titulo: "Vaginose bacteriana" },
  { id: "58",  titulo: "Doença inflamatória pélvica" },
  { id: "59",  titulo: "HIV" },
  { id: "60",  titulo: "Tuberculose" },
  { id: "61",  titulo: "Rinossinusite" },
  { id: "62",  titulo: "Otite" },
  { id: "63",  titulo: "Faringo-amigdalite" },
  { id: "64",  titulo: "Pneumonia" },
  { id: "65",  titulo: "Influenza" },
  { id: "66",  titulo: "COVID-19" },
  { id: "67",  titulo: "Bronquiectasia" },
  { id: "68",  titulo: "Tuberculose pulmonar" },
  { id: "69",  titulo: "Asma" },
  { id: "70",  titulo: "Diagnóstico diferencial" },
  { id: "71",  titulo: "DPOC" },
  { id: "72",  titulo: "Tromboembolismo pulmonar" },
  { id: "73",  titulo: "Hipertensão pulmonar" },
  { id: "74",  titulo: "Crise hipertensiva" },
  { id: "75",  titulo: "Hipertensão arterial sistêmica" },
  { id: "76",  titulo: "Insuficiência cardíaca" },
  { id: "77",  titulo: "Fibrilação atrial crônica" },
  { id: "78",  titulo: "Bradiarritmias" },
  { id: "79",  titulo: "Dislipidemia" },
  { id: "80",  titulo: "Diabetes mellitus tipo 2" },
  { id: "81",  titulo: "Hipotireoidismo" },
  { id: "82",  titulo: "Hipertireoidismo" },
  { id: "83",  titulo: "Osteoporose" },
  { id: "84",  titulo: "Gota" },
  { id: "85",  titulo: "Artrite reumatoide" },
  { id: "86",  titulo: "Lúpus eritematoso sistêmico" },
  { id: "87",  titulo: "Dispepsia" },
  { id: "88",  titulo: "DRGE" },
  { id: "89",  titulo: "Doença de Crohn e Retocolite" },
  { id: "90",  titulo: "Síndrome do intestino irritável" },
  { id: "91",  titulo: "Constipação intestinal" },
  { id: "92",  titulo: "Doença hemorroidária" },
  { id: "93",  titulo: "Hepatite B" },
  { id: "94",  titulo: "Hepatite C" },
  { id: "95",  titulo: "Cirrose hepática" },
  { id: "96",  titulo: "ITU" },
  { id: "97",  titulo: "Nefrolitíase" },
  { id: "98",  titulo: "Doença renal crônica" },
  { id: "99",  titulo: "Síndrome nefrótica" },
  { id: "100", titulo: "Anemia ferropriva" },
  { id: "101", titulo: "Anemia megaloblástica" },
  { id: "102", titulo: "Ansiedade" },
  { id: "103", titulo: "Depressão" },
  { id: "104", titulo: "Transtorno bipolar" },
  { id: "105", titulo: "Esquizofrenia" },
  { id: "106", titulo: "Alcoolismo" },
  { id: "107", titulo: "Dor lombar" },
  { id: "108", titulo: "Cefaleia" },
  { id: "109", titulo: "Enxaqueca" },
  { id: "110", titulo: "Epilepsia" },
  { id: "111", titulo: "Doença de Parkinson" },
  { id: "112", titulo: "Demência e Alzheimer" },
  { id: "113", titulo: "Hiperplasia prostática benigna" },
  { id: "114", titulo: "Disfunção erétil" },
];

// Clinical image pages (from prior extraction — non-header, non-QR sizes)
const CLINICAL_PAGES = [7, 8, 13, 94, 95, 167, 181, 184, 187, 196, 197, 198, 199, 200, 204, 305, 306, 307, 331, 392, 403, 456, 472, 476, 480, 488, 489];

// ── Load pdfjs ────────────────────────────────────────────────────────────────
const pdfjsMod = await import('../node_modules/pdfjs-dist/legacy/build/pdf.mjs');
const { getDocument, GlobalWorkerOptions } = pdfjsMod;
const workerPath = fileURLToPath(new URL('../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url));
GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

const pdfData = new Uint8Array(readFileSync(PDF));
const pdf = await getDocument({ data: pdfData, useWorkerFetch: false, isEvalSupported: false, disableWorker: true }).promise;
console.log(`PDF loaded: ${pdf.numPages} pages`);

// ── Step 1: Extract text from ALL pages to map topics ────────────────────────
// Build an array of [pageNum, text] for all pages
console.log('\n=== Extracting text from all pages to map topics ===');

// Normalize a title for fuzzy matching
const norm = (s) => s.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const normTitles = TOPICS.map(t => ({ ...t, norm: norm(t.titulo) }));

// pageTopicStart[pageNum] = topicId that starts on that page
const pageTopicStart = {};

for (let p = 1; p <= pdf.numPages; p++) {
  const page = await pdf.getPage(p);
  const tc = await page.getTextContent();
  const text = tc.items.map(i => i.str).join(' ');
  const textNorm = norm(text);

  // Check if any topic title appears in this page's text
  for (const topic of normTitles) {
    if (textNorm.includes(topic.norm)) {
      if (!pageTopicStart[p]) pageTopicStart[p] = [];
      pageTopicStart[p].push(topic.id);
    }
  }

  if (p % 50 === 0) process.stdout.write(`\r  Progress: ${p}/${pdf.numPages}`);
}
process.stdout.write(`\r  Progress: ${pdf.numPages}/${pdf.numPages}\n`);

console.log('\nTopic-start pages found:', JSON.stringify(pageTopicStart, null, 2));

// Build page → current topic map (most recent topic before each page)
// Since topic IDs are ordered, for each page find the topic ID where the
// topic's title first appears on a page <= that page number
const topicFirstPage = {}; // topicId → first page it appears on
for (const [pageStr, ids] of Object.entries(pageTopicStart)) {
  for (const id of ids) {
    const p = Number(pageStr);
    if (!topicFirstPage[id] || p < topicFirstPage[id]) {
      topicFirstPage[id] = p;
    }
  }
}

console.log('\nTopic first pages:', JSON.stringify(topicFirstPage, null, 2));

// For each clinical image page, find the most recently started topic
function getTopicForPage(pageNum) {
  let bestId = null;
  let bestPage = 0;
  for (const [id, firstPage] of Object.entries(topicFirstPage)) {
    if (firstPage <= pageNum && firstPage > bestPage) {
      bestPage = firstPage;
      bestId = id;
    }
  }
  return bestId;
}

// ── Step 2: Convert clinical raw images to PNG ────────────────────────────────
console.log('\n=== Converting clinical images to PNG ===');

const topicImages = {}; // topicId → ['/prescricoes-images/{topicId}/img_{n}.png', ...]

for (const pageNum of CLINICAL_PAGES) {
  const pageDir = join(RAW, String(pageNum));
  if (!existsSync(pageDir)) continue;

  const topicId = getTopicForPage(pageNum);
  if (!topicId) {
    console.log(`  Page ${pageNum}: no topic found, skipping`);
    continue;
  }

  const topicOutDir = join(OUT, 'topic', topicId);
  mkdirSync(topicOutDir, { recursive: true });

  // Find clinical images on this page (skip header 1710x257 and QR 338x636)
  let imgIdx = 0;
  let metaFiles = [];
  try {
    metaFiles = readdirSync(pageDir).filter(f => f.endsWith('.meta.json')).sort();
  } catch { continue; }

  for (const metaFile of metaFiles) {
    const meta = JSON.parse(readFileSync(join(pageDir, metaFile), 'utf8'));
    const { width, height, kind } = meta;

    // Skip standard ebook elements
    if ((width === 1710 && height === 257) || (width === 338 && height === 636)) continue;

    const rawFile = metaFile.replace('.meta.json', '.raw');
    const rawPath = join(pageDir, rawFile);
    if (!existsSync(rawPath)) continue;

    const rawData = readFileSync(rawPath);

    // Determine sharp format based on kind
    // kind=1 = GRAYSCALE_1BPP, kind=2 = RGB_24BPP, kind=3 = RGBA_32BPP
    const channels = kind === 1 ? 1 : kind === 2 ? 3 : 4;

    const outFilename = `img_${imgIdx}.png`;
    const outPath = join(topicOutDir, outFilename);

    try {
      await sharp(rawData, {
        raw: { width, height, channels }
      }).png().toFile(outPath);

      const webPath = `/prescricoes-images/topic/${topicId}/${outFilename}`;
      if (!topicImages[topicId]) topicImages[topicId] = [];
      topicImages[topicId].push(webPath);

      console.log(`  Page ${pageNum} → topic ${topicId}: ${outFilename} (${width}x${height})`);
      imgIdx++;
    } catch (e) {
      console.log(`  Page ${pageNum}: FAILED to convert ${rawFile}: ${e.message}`);
    }
  }
}

console.log('\n=== Topic → Images mapping ===');
console.log(JSON.stringify(topicImages, null, 2));

// Save the mapping for use in prescricoes-content.json update
writeFileSync(join(ROOT, 'public', 'prescricoes-images', '_topic-images.json'), JSON.stringify(topicImages, null, 2));
console.log('\nSaved mapping to public/prescricoes-images/_topic-images.json');

// Also save the full page-topic mapping for reference
writeFileSync(join(ROOT, 'public', 'prescricoes-images', '_topic-pages.json'), JSON.stringify(topicFirstPage, null, 2));
console.log('Saved page-topic map to public/prescricoes-images/_topic-pages.json');
