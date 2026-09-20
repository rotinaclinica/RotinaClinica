// Limpa o CPF das contas de teste que estavam duplicando o CPF do Lucas.
// Uso: node scripts/clear-test-account-cpf.mjs
//      node scripts/clear-test-account-cpf.mjs --apply

import { readFileSync } from "fs";
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

const APPLY = process.argv.includes("--apply");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const testEmails = [
  "testando12345@gmail.com",
  "teste12345@teste.com",
  "ebook@teste.com",
];

const { rows } = await pool.query(
  `SELECT id, email, name, cpf FROM "User" WHERE email = ANY($1)`,
  [testEmails]
);

console.log(`Encontradas ${rows.length} contas de teste com CPF:\n`);
for (const r of rows) {
  console.log(`  ${r.email} · ${r.name} · id=${r.id}`);
}

if (!APPLY) {
  console.log("\nDry-run. Rode com --apply para limpar o CPF dessas contas.");
} else {
  const result = await pool.query(
    `UPDATE "User" SET cpf = NULL, "cpfHash" = NULL WHERE email = ANY($1)`,
    [testEmails]
  );
  console.log(`\n✅ CPF limpo em ${result.rowCount} contas.`);
}

await pool.end();
