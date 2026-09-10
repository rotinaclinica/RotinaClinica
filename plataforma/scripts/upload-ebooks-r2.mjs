import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync, statSync } from "fs";

const accountId = process.env.R2_ACCOUNT_ID;
const endpoint = process.env.R2_ENDPOINT && !process.env.R2_ENDPOINT.includes("<")
  ? process.env.R2_ENDPOINT
  : `https://${accountId}.r2.cloudflarestorage.com`;
const Bucket = process.env.R2_BUCKET_NAME;

if (!accountId || accountId === "..." || !Bucket || !process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID === "...") {
  console.error("Credenciais R2 ausentes/placeholder. Puxe as reais da Vercel primeiro:");
  console.error("  vercel env pull .env.r2 --environment=production");
  console.error("  node --env-file=.env.r2 scripts/upload-ebooks-r2.mjs");
  process.exit(1);
}

const r2 = new S3Client({
  region: "auto",
  endpoint,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const uploads = [
  { file: "public/ebook/Manual de prescrições Rotina Clínica.pdf", key: "ebooks/manual-prescricoes.pdf" },
  { file: "public/ebook/Guia de intubação orotraqueal, sedação e ventilação mecânica.pdf", key: "ebooks/guia-intubacao.pdf" },
];

for (const u of uploads) {
  const sizeMB = (statSync(u.file).size / 1024 / 1024).toFixed(1);
  process.stdout.write(`Enviando ${u.key} (${sizeMB}MB)... `);
  const Body = readFileSync(u.file);
  await r2.send(new PutObjectCommand({ Bucket, Key: u.key, Body, ContentType: "application/pdf" }));
  const head = await r2.send(new HeadObjectCommand({ Bucket, Key: u.key }));
  console.log(`OK (R2 confirma ${(head.ContentLength / 1024 / 1024).toFixed(1)}MB)`);
}

console.log("\n✅ Upload concluído. Os 2 ebooks estão no R2 sob ebooks/.");
