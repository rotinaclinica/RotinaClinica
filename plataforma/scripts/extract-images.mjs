// One-time script: extract embedded images from each PDF page
// Run from: plataforma/ directory with: node scripts/extract-images.mjs

import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const ROOT  = fileURLToPath(new URL('..', import.meta.url));
const PDF   = join(ROOT, 'public', 'ebook', 'Guia de prescrições Rotina Clínica (1).pdf');
const OUT   = join(ROOT, 'public', 'prescricoes-images');

const pdfjsMod = await import('../node_modules/pdfjs-dist/legacy/build/pdf.mjs');
const { getDocument, GlobalWorkerOptions } = pdfjsMod;
// Point worker to the bundled worker file (must be a file:// URL on Windows)
const workerPath = fileURLToPath(new URL('../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url));
GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

const pdfData = new Uint8Array(readFileSync(PDF));
const pdf     = await getDocument({ data: pdfData, useWorkerFetch: false, isEvalSupported: false, disableWorker: true }).promise;

console.log(`Loaded PDF: ${pdf.numPages} pages`);

const pagesWithImages = [];

for (let p = 1; p <= pdf.numPages; p++) {
  const page = await pdf.getPage(p);
  const ops  = await page.getOperatorList();

  // Collect unique image keys referenced on this page
  const imageKeys = new Set();
  for (let i = 0; i < ops.fnArray.length; i++) {
    if ([85, 86, 88].includes(ops.fnArray[i])) {
      const key = ops.argsArray[i]?.[0];
      if (typeof key === 'string') imageKeys.add(key);
    }
  }

  if (imageKeys.size === 0) { process.stdout.write('.'); continue; }

  process.stdout.write(`\nPage ${p}: ${imageKeys.size} image(s)`);
  pagesWithImages.push({ page: p, keys: [...imageKeys] });

  const outDir = join(OUT, String(p));
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  let idx = 0;
  for (const key of imageKeys) {
    try {
      // pdfjs caches image after getOperatorList — retrieve from page.objs
      const img = await new Promise((res, rej) => {
        page.objs.get(key, res);
        setTimeout(() => rej(new Error('timeout')), 3000);
      });

      if (!img) { process.stdout.write(` [${key}: null]`); continue; }

      const { width, height, data, kind } = img;
      process.stdout.write(` [${key}: ${width}x${height} kind=${kind}]`);

      // kind=1 = GRAYSCALE_1BPP, kind=2 = RGB_24BPP, kind=3 = RGBA_32BPP
      const bytesPerPx = kind === 1 ? 1 : kind === 2 ? 3 : 4;
      const raw = Buffer.from(data instanceof Uint8ClampedArray ? data : data.buffer);

      // Write raw pixel data + metadata header so we can convert later
      const meta = JSON.stringify({ width, height, kind, bytesPerPx });
      const metaPath = join(outDir, `img_${idx}.meta.json`);
      const rawPath  = join(outDir, `img_${idx}.raw`);
      writeFileSync(metaPath, meta);
      writeFileSync(rawPath, raw);
      idx++;
    } catch (e) {
      process.stdout.write(` [${key}: ERR ${e.message}]`);
    }
  }
}

console.log('\n\nDone. Pages with images:', pagesWithImages.map(p => p.page).join(', '));
writeFileSync(join(OUT, '_index.json'), JSON.stringify(pagesWithImages, null, 2));
