// Preenche Order.buyerSnapshot dos pedidos PAID existentes com os dados atuais
// do User (antes de qualquer anonimização). Idempotente: pula pedidos que já
// têm snapshot ou cujo User já está anonimizado.
//
// Uso:
//   node scripts/backfill-buyer-snapshot.mjs           (dry-run)
//   node scripts/backfill-buyer-snapshot.mjs --apply

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

function encryptJson(obj) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(JSON.stringify(obj), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

function decryptCpf(stored) {
  if (!stored) return null;
  if (!stored.startsWith(PREFIX)) return stored.replace(/\D/g, "") || null;
  const parts = stored.split(":");
  if (parts.length !== 5) return null;
  try {
    const iv = Buffer.from(parts[2], "base64");
    const tag = Buffer.from(parts[3], "base64");
    const enc = Buffer.from(parts[4], "base64");
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
  } catch { return null; }
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const { rows } = await pool.query(`
  SELECT
    o.id AS order_id,
    o."paidAt",
    u.name, u.email, u.cpf, u.cep, u.phone, u."anonymizedAt"
  FROM "Order" o
  JOIN "User" u ON u.id = o."userId"
  WHERE o.status = 'PAID'
    AND o."buyerSnapshot" IS NULL
`);

let toBackfill = 0;
let skippedAnon = 0;
let updated = 0;
let errors = 0;

for (const r of rows) {
  if (r.anonymizedAt) { skippedAnon++; continue; }
  toBackfill++;
  if (!APPLY) continue;

  const snap = encryptJson({
    name: r.name,
    email: r.email,
    cpf: decryptCpf(r.cpf),
    cep: r.cep,
    phone: r.phone,
    capturedAt: (r.paidAt ?? new Date()).toISOString(),
  });

  try {
    await pool.query(`UPDATE "Order" SET "buyerSnapshot" = $1 WHERE id = $2`, [snap, r.order_id]);
    updated++;
  } catch (e) {
    console.error(`Erro ao atualizar ${r.order_id}:`, e.message);
    errors++;
  }
}

console.log("");
console.log("=".repeat(50));
console.log(`Pedidos PAID sem snapshot: ${rows.length}`);
console.log(`Pulados (user anonimizado): ${skippedAnon}`);
console.log(`A preencher:               ${toBackfill}`);
if (APPLY) console.log(`Preenchidos agora:         ${updated}`);
console.log(`Erros:                     ${errors}`);
console.log("=".repeat(50));
if (!APPLY) console.log("\nDry-run. Rode com --apply para executar.");

await pool.end();
