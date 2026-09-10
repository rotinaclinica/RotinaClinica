import { put } from "@vercel/blob";
import { readFileSync, statSync } from "fs";

const token = (process.env.BLOB_READ_WRITE_TOKEN ?? "").trim().replace(/^["']+|["']+$/g, "");
if (!token || !token.startsWith("vercel_blob_")) {
  console.error("❌ Falta BLOB_READ_WRITE_TOKEN válido no ambiente.");
  console.error("Rode com: node --env-file=.env.blob.local scripts/upload-ebooks-blob.mjs");
  process.exit(1);
}

const files = [
  { path: "public/ebook/Manual de prescrições Rotina Clínica.pdf", key: "ebooks/manual-prescricoes.pdf" },
  { path: "public/ebook/Guia de intubação orotraqueal, sedação e ventilação mecânica.pdf", key: "ebooks/guia-intubacao.pdf" },
];

for (const f of files) {
  const sizeMB = (statSync(f.path).size / 1024 / 1024).toFixed(1);
  process.stdout.write(`Enviando ${f.key} (${sizeMB}MB)... `);
  const body = readFileSync(f.path);
  const blob = await put(f.key, body, {
    access: "private",
    token,
    contentType: "application/pdf",
    allowOverwrite: true,
    addRandomSuffix: false,
  });
  console.log("OK");
  console.log("   pathname:", blob.pathname);
  console.log("   url:", blob.url);
  console.log("   downloadUrl:", blob.downloadUrl);
}

console.log("\n✅ Upload concluído. Me mande as 2 URLs acima.");
