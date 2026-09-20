// One-time migration: criptografa CPFs em texto plano no banco.
// Idempotente: valores já criptografados (prefixo enc:v1:) são ignorados.
//
// Uso:
//   1. Garanta CPF_ENCRYPTION_KEY (base64 de 32 bytes) e DATABASE_URL no .env
//      Para gerar a chave:
//        node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
//   2. node scripts/migrate-cpf-encrypt.mjs           (dry-run: mostra quantos serão migrados)
//   3. node scripts/migrate-cpf-encrypt.mjs --apply   (executa a migração)

import { readFileSync } from "fs";
import { resolve } from "path";
import crypto from "node:crypto";
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
const ALGO = "aes-256-gcm";
const VERSION = "v1";
const PREFIX = `enc:${VERSION}:`;

const rawKey = process.env.CPF_ENCRYPTION_KEY;
if (!rawKey) { console.error("ERRO: CPF_ENCRYPTION_KEY não configurada"); process.exit(1); }
const key = Buffer.from(rawKey, "base64");
if (key.length !== 32) { console.error("ERRO: CPF_ENCRYPTION_KEY deve ter 32 bytes em base64"); process.exit(1); }
const pepper = process.env.CPF_HASH_PEPPER ?? "";

function encryptCpf(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

function hashCpf(plain) {
  return crypto.createHash("sha256").update(plain + pepper).digest("hex");
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const { rows } = await pool.query(
  `SELECT id, cpf, "cpfHash" FROM "User" WHERE cpf IS NOT NULL`
);

let toMigrate = 0;
let alreadyEncrypted = 0;
let updated = 0;
let errors = 0;

for (const row of rows) {
  if (row.cpf.startsWith(PREFIX)) {
    alreadyEncrypted++;
    // Garante que o hash existe mesmo se já estava criptografado
    if (!row.cpfHash) {
      console.warn(`Usuário ${row.id}: CPF criptografado mas sem hash — sem como recuperar o plaintext`);
    }
    continue;
  }
  const digits = row.cpf.replace(/\D/g, "");
  if (digits.length !== 11) {
    console.warn(`Usuário ${row.id}: CPF inválido "${row.cpf}" (${digits.length} dígitos) — pulando`);
    errors++;
    continue;
  }
  toMigrate++;
  if (!APPLY) continue;
  try {
    await pool.query(
      `UPDATE "User" SET cpf = $1, "cpfHash" = $2 WHERE id = $3`,
      [encryptCpf(digits), hashCpf(digits), row.id]
    );
    updated++;
  } catch (e) {
    console.error(`Erro ao migrar ${row.id}:`, e.message);
    errors++;
  }
}

console.log("");
console.log("=".repeat(50));
console.log(`Total com CPF:       ${rows.length}`);
console.log(`Já criptografados:   ${alreadyEncrypted}`);
console.log(`A migrar:            ${toMigrate}`);
if (APPLY) console.log(`Migrados agora:      ${updated}`);
console.log(`Erros:               ${errors}`);
console.log("=".repeat(50));
if (!APPLY) console.log("\nDry-run. Rode novamente com --apply para executar.");

await pool.end();
