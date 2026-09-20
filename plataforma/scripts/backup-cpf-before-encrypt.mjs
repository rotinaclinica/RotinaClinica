// Backup: exporta todos os CPFs em texto plano para JSON antes da criptografia.
// Uso: node scripts/backup-cpf-before-encrypt.mjs
// Saída: backup-cpf-YYYY-MM-DD-HHmm.json (na raiz de plataforma/)

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import pg from "pg";

function loadEnvFile(p) {
  try {
    const content = readFileSync(p, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      if (!process.env[key]) process.env[key] = val;
    }
  } catch { }
}
loadEnvFile(resolve(import.meta.dirname, "../.env"));

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const { rows } = await pool.query(`SELECT id, email, cpf FROM "User" WHERE cpf IS NOT NULL`);

const now = new Date();
const stamp = now.toISOString().slice(0, 16).replace(/[:T]/g, "-");
const outPath = resolve(import.meta.dirname, `../backup-cpf-${stamp}.json`);

writeFileSync(outPath, JSON.stringify({ createdAt: now.toISOString(), count: rows.length, rows }, null, 2), "utf8");

console.log(`Backup gravado: ${outPath}`);
console.log(`Total de CPFs: ${rows.length}`);

await pool.end();
