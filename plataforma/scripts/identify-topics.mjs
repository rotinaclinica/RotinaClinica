// Extract text from clinical image pages to identify their topics
import { readFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { join } from 'path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PDF = join(ROOT, 'public', 'ebook', 'Guia de prescrições Rotina Clínica (1).pdf');

const pdfjsMod = await import('../node_modules/pdfjs-dist/legacy/build/pdf.mjs');
const { getDocument, GlobalWorkerOptions } = pdfjsMod;
const workerPath = fileURLToPath(new URL('../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url));
GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

const pdfData = new Uint8Array(readFileSync(PDF));
const pdf = await getDocument({ data: pdfData, useWorkerFetch: false, isEvalSupported: false, disableWorker: true }).promise;

const CLINICAL = [7, 8, 13, 94, 95, 167, 181, 184, 187, 196, 197, 198, 199, 200, 204, 305, 306, 307, 331, 392, 403, 456, 472, 476, 480, 488, 489];

for (const p of CLINICAL) {
  const page = await pdf.getPage(p);
  const tc = await page.getTextContent();
  const text = tc.items.map(i => i.str).join(' ');
  console.log(`\n--- Page ${p} ---`);
  console.log(text.slice(0, 300));
}
