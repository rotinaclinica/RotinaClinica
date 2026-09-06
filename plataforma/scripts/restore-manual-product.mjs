// Run once to restore the deleted product: node scripts/restore-manual-product.mjs
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PrismaClient } = require("../app/generated/prisma/client/index.js");

const db = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  const existing = await db.product.findUnique({ where: { id: "ebook-free-manual" } });
  if (existing) {
    console.log("Product already exists:", existing.title);
    return;
  }

  const product = await db.product.create({
    data: {
      id: "ebook-free-manual",
      slug: "manual-prescricoes-gratis",
      title: "Manual de Prescrições (Amostra)",
      description: "Amostra gratuita do nosso e-book mais acessado. Baixe agora.",
      type: "EBOOK_FREE",
      priceCents: 0,
      currency: "BRL",
      active: true,
      fileKey: null,
    },
  });

  console.log("Product restored:", product.id, product.title);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
