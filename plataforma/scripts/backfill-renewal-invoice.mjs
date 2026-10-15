// Cria o pedido (Order PAID) + nota pendente para cobranças recorrentes do
// Asaas que foram processadas antes do webhook passar a registrá-las.
// O cron de NFS-e emite a nota na próxima execução.
//
// Uso:
//   NFE_ENABLED=true NFE_PROVIDER=asaas npx tsx --env-file=.env scripts/backfill-renewal-invoice.mjs pay_xxx [pay_yyy]           (dry-run)
//   NFE_ENABLED=true NFE_PROVIDER=asaas npx tsx --env-file=.env scripts/backfill-renewal-invoice.mjs pay_xxx [pay_yyy] --apply

import { db } from "../lib/db.ts";
import { captureBuyerSnapshot } from "../lib/crypto/buyer-snapshot.ts";
import { createPendingInvoiceForOrder } from "../lib/nfe/index.ts";

const APPLY = process.argv.includes("--apply");
const ids = process.argv.slice(2).filter((a) => a.startsWith("pay_"));
const base = process.env.ASAAS_BASE_URL ?? "https://api.asaas.com/v3";

for (const paymentId of ids) {
  const p = await (await fetch(`${base}/payments/${paymentId}`, { headers: { access_token: process.env.ASAAS_API_KEY } })).json();
  if (!p.subscription || !["CONFIRMED", "RECEIVED"].includes(p.status)) { console.log(paymentId, "ignorado:", p.status, p.subscription); continue; }
  if (await db.order.findFirst({ where: { provider: "ASAAS", providerRef: paymentId } })) { console.log(paymentId, "já tem pedido"); continue; }
  const sub = await db.subscription.findUnique({ where: { asaasSubscriptionId: p.subscription } });
  if (!sub) { console.log(paymentId, "assinatura não encontrada"); continue; }
  const original = p.externalReference ? await db.order.findUnique({ where: { id: p.externalReference }, include: { items: true } }) : null;
  const productId = original?.items[0]?.productId;
  const cents = Math.round(p.value * 100);
  console.log(paymentId, { userId: sub.userId, cents, productId, paidAt: p.confirmedDate ?? p.paymentDate });
  if (!APPLY || !productId) continue;
  const order = await db.order.create({
    data: {
      userId: sub.userId, status: "PAID", provider: "ASAAS", providerRef: paymentId, totalCents: cents,
      paymentMethod: p.billingType === "PIX" ? "pix" : "credit_card",
      paidAt: new Date(p.confirmedDate ?? p.paymentDate ?? Date.now()),
      buyerSnapshot: (await captureBuyerSnapshot(sub.userId)) ?? original?.buyerSnapshot ?? null,
      items: { create: { productId, priceCents: cents } },
    },
  });
  await createPendingInvoiceForOrder(order.id);
  console.log(paymentId, "→ pedido", order.id, "+ nota pendente");
}
await db.$disconnect();
