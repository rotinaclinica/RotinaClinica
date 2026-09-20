// Lista os CPFs duplicados no banco.
// Uso: node scripts/find-cpf-duplicates.mjs

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

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Pega o CPF em texto (só se ainda não estiver criptografado) e agrupa
const { rows } = await pool.query(`
  SELECT
    regexp_replace(cpf, '[^0-9]', '', 'g') AS cpf_digits,
    COUNT(*) AS total,
    array_agg(id ORDER BY "createdAt") AS ids,
    array_agg(email ORDER BY "createdAt") AS emails,
    array_agg("createdAt" ORDER BY "createdAt") AS created_ats,
    array_agg(name ORDER BY "createdAt") AS names
  FROM "User"
  WHERE cpf IS NOT NULL
    AND cpf NOT LIKE 'enc:%'
  GROUP BY regexp_replace(cpf, '[^0-9]', '', 'g')
  HAVING COUNT(*) > 1
  ORDER BY total DESC
`);

if (rows.length === 0) {
  console.log("Nenhum CPF duplicado encontrado.");
} else {
  console.log(`${rows.length} CPFs duplicados:\n`);
  for (const r of rows) {
    const cpfMasked = r.cpf_digits.slice(0, 3) + ".***.***-" + r.cpf_digits.slice(-2);
    console.log(`CPF ${cpfMasked} · ${r.total} contas:`);
    for (let i = 0; i < r.ids.length; i++) {
      const created = new Date(r.created_ats[i]).toLocaleDateString("pt-BR");
      console.log(`  [${i === 0 ? "MAIS ANTIGO" : "duplicata "}] ${r.emails[i]} · ${r.names[i] ?? "(sem nome)"} · ${created} · id=${r.ids[i]}`);
    }
    console.log("");
  }
}

await pool.end();
