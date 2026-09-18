// One-time script: grant 1 month bonus to ambassador Raissa Sibajev
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
const email = "rasibajev01@gmail.com";

// Find user
const { rows: users } = await pool.query('SELECT id, name, email FROM "User" WHERE email = $1', [email]);
if (users.length === 0) { console.error("User not found:", email); process.exit(1); }
const user = users[0];
console.log("User found:", user);

// Find subscription
const { rows: subs } = await pool.query('SELECT * FROM "Subscription" WHERE "userId" = $1', [user.id]);
console.log("Current subscription:", subs[0] ?? "none");

const now = new Date();
let base;
if (subs.length > 0 && subs[0].status === "ACTIVE" && new Date(subs[0].currentPeriodEnd) > now) {
  base = new Date(subs[0].currentPeriodEnd);
} else {
  base = new Date(now);
}
const newEnd = new Date(base);
newEnd.setDate(newEnd.getDate() + 90); // 3 meses bônus de boas-vindas
console.log(`Extending subscription to: ${newEnd.toISOString()}`);

if (subs.length > 0) {
  await pool.query('UPDATE "Subscription" SET "currentPeriodEnd" = $1, "updatedAt" = NOW() WHERE "userId" = $2', [newEnd, user.id]);
  console.log("Subscription updated.");
} else {
  await pool.query(
    `INSERT INTO "Subscription" ("id","userId","plan","status","currentPeriodStart","currentPeriodEnd","provider","providerRef","createdAt","updatedAt")
     VALUES (gen_random_uuid(),$1,'MONTHLY','ACTIVE',$2,$3,'STRIPE','ambassador_welcome_raissa',NOW(),NOW())`,
    [user.id, now, newEnd]
  );
  console.log("Subscription created.");
}

const { rows: after } = await pool.query('SELECT "currentPeriodEnd" FROM "Subscription" WHERE "userId" = $1', [user.id]);
console.log("New period end:", after[0]?.currentPeriodEnd);
await pool.end();
