// Define/atualiza o PIN admin de um usuário.
// Uso:
//   node scripts/set-admin-pin.mjs <email> <pin6dig>

import { readFileSync } from "fs";
import { resolve } from "path";
import bcrypt from "bcryptjs";
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

const email = process.argv[2];
const pin = process.argv[3];

if (!email || !pin) {
  console.error("Uso: node scripts/set-admin-pin.mjs <email> <pin6dig>");
  process.exit(1);
}

if (!/^\d{6}$/.test(pin)) {
  console.error("PIN deve conter exatamente 6 dígitos.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const { rows } = await pool.query(
  `SELECT id, name, role FROM "User" WHERE lower(email) = lower($1)`,
  [email]
);

if (rows.length === 0) {
  console.error(`Usuário não encontrado: ${email}`);
  await pool.end();
  process.exit(1);
}

const user = rows[0];
if (user.role !== "ADMIN") {
  console.error(`Usuário ${email} não é ADMIN (role=${user.role}).`);
  await pool.end();
  process.exit(1);
}

const hash = await bcrypt.hash(pin, 12);

await pool.query(
  `UPDATE "User" SET "adminPinHash" = $1 WHERE id = $2`,
  [hash, user.id]
);

console.log(`✅ PIN admin definido para ${user.name} (${email}).`);
await pool.end();
