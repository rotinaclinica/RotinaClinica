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

// Black Week 2026: 30% no anual (Pix/cartão) e no mensal (cartão, 12 cobranças — ver lib/promocoes.ts).
// Run once: npx tsx scripts/seed-coupon-blackweek.mjs
const { PrismaClient } = await import("../app/generated/prisma/client.ts");
const { PrismaPg } = await import("@prisma/adapter-pg");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const products = await db.product.findMany({
  where: { slug: { in: ["assinatura-anual", "assinatura-mensal"] } },
  select: { id: true, slug: true, priceCents: true },
});
if (products.length !== 2) throw new Error("Produtos de assinatura não encontrados");

const data = {
  discountType: "PERCENT",
  discountValue: 30,
  active: true,
  expiresAt: new Date("2026-12-01T03:00:00Z"), // 30/11/2026 23h59 em Brasília
  products: { set: products.map((p) => ({ id: p.id })) },
};
const c = await db.coupon.upsert({
  where: { code: "BLACKWEEK30" },
  create: { code: "BLACKWEEK30", ...data, products: { connect: products.map((p) => ({ id: p.id })) } },
  update: data,
  include: { products: { select: { slug: true, priceCents: true } } },
});
console.log(c.code, c.discountType, c.discountValue, c.expiresAt.toISOString(), c.products);
process.exit(0);
