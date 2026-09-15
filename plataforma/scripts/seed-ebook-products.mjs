// Run once: npx tsx scripts/seed-ebook-products.mjs
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local
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

const products = [
  {
    slug: "manual-prescricoes",
    title: "Manual Prático de Prescrições: Da UBS à Emergência",
    description: "Nunca mais trave na hora de prescrever! Consulte mais de 224 modelos de prescrições prontas em segundos — da UBS à emergência.",
    type: "DOWNLOAD",
    priceCents: 9700,
    coverImage: "/images/ebook-manual.png",
    fileKey: "https://ou9gedwcm8mxxcyr.private.blob.vercel-storage.com/ebooks/manual-prescricoes.pdf",
  },
  {
    slug: "sedacao-iot-vm",
    title: "Sedação, Intubação Orotraqueal e Ventilação Mecânica",
    description: "Prepare-se para acabar com o medo da intubação orotraqueal e adquirir segurança e efetividade!",
    type: "DOWNLOAD",
    priceCents: 4700,
    coverImage: "/images/ebook-iot.png",
    fileKey: "https://ou9gedwcm8mxxcyr.private.blob.vercel-storage.com/ebooks/guia-intubacao.pdf",
  },
  {
    slug: "destravando-o-plantao",
    title: "Destravando o Plantão",
    description: "Domine as 10 principais queixas do paciente adulto no PS. A faculdade te ensinou a teoria, mas a realidade do plantão exige decisões rápidas, raciocínio clínico e condutas efetivas.",
    type: "COURSE",
    priceCents: 39700,
    coverImage: "/images/curso-plantao.png",
  },
];

for (const product of products) {
  const existing = await db.product.findUnique({ where: { slug: product.slug } });
  if (existing) {
    console.log(`✓ "${product.slug}" já existe (id: ${existing.id})`);
  } else {
    const created = await db.product.create({ data: product });
    console.log(`+ Criado "${product.slug}" (id: ${created.id})`);
  }
}

console.log("Done.");
process.exit(0);
