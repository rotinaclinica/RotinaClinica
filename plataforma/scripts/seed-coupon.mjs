// Run once: npx tsx scripts/seed-coupon.mjs
import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(import.meta.dirname, "../.env");
const envContent = readFileSync(envPath, "utf8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = val;
}

const { PrismaClient } = await import("../app/generated/prisma/client.ts");
const { PrismaPg } = await import("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const coupon = {
  code: "ROTINA102710@@",
  discountType: "PERCENT",
  discountValue: 100,
  active: true,
};

const existing = await db.coupon.findUnique({ where: { code: coupon.code } });
if (existing) {
  console.log(`✓ Cupom "${coupon.code}" já existe (id: ${existing.id})`);
} else {
  const created = await db.coupon.create({ data: coupon });
  console.log(`+ Cupom "${coupon.code}" criado (id: ${created.id}) — 100% de desconto`);
}

console.log("Done.");
process.exit(0);
