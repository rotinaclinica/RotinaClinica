// Só leitura: números da Black Week 2026 para análise pós-campanha.
// Uso: npx tsx --env-file=.env --env-file=.env.local scripts/bw-analise-leitura.mts
import { db } from "../lib/db";
import { getExcludedEmails, ADMIN_TEST_EMAILS } from "../app/admin/_lib/excluded-emails";

const INI = new Date("2026-11-15T03:00:00Z");
const excl = new Set([...(await getExcludedEmails()), ...ADMIN_TEST_EMAILS].map((e) => e.toLowerCase()));
const brt = (d: Date) => new Date(d.getTime() - 3 * 3600e3).toISOString().slice(0, 16).replace("T", " ");

const views = await db.pageView.findMany({ where: { path: { startsWith: "/oferta/blackweek" } }, orderBy: { createdAt: "asc" } });
const pag = views.filter((v) => !v.path.includes("/checkout"));
const chk = views.filter((v) => v.path.includes("/checkout"));
const porDia = new Map<string, Set<string>>();
for (const v of pag) { const d = brt(v.createdAt).slice(0, 10); if (!porDia.has(d)) porDia.set(d, new Set()); porDia.get(d)!.add(v.userId); }
const porOrig = new Map<string, Set<string>>();
for (const v of pag) { const o = v.path.split("?o=")[1] ?? "?"; if (!porOrig.has(o)) porOrig.set(o, new Set()); porOrig.get(o)!.add(v.userId); }
console.log("== /black-week: pessoas únicas", new Set(pag.map((v) => v.userId)).size, "| checkout da oferta:", new Set(chk.map((v) => v.userId)).size);
console.log("por dia:", [...porDia].map(([d, s]) => `${d}=${s.size}`).join(" "));
console.log("por origem:", [...porOrig].sort((a, b) => b[1].size - a[1].size).map(([o, s]) => `${o}=${s.size}`).join(" | "));
console.log("checkouts:", chk.map((v) => `${brt(v.createdAt)} ${v.path.split("?o=")[1]}`).join(" ; "));
const anonCk = new Set(chk.map((v) => v.userId));
const pagDeQuemAbriuCk = pag.filter((v) => anonCk.has(v.userId)).map((v) => v.path.split("?o=")[1]);
console.log("origem de quem abriu checkout:", pagDeQuemAbriuCk.join(", "));

const orders = await db.order.findMany({ where: { createdAt: { gte: INI } }, include: { user: { select: { email: true, createdAt: true } }, items: { include: { product: { select: { slug: true } } } } }, orderBy: { createdAt: "asc" } });
console.log("\n== Pedidos desde 15/11:", orders.length);
for (const o of orders) {
  if (excl.has(o.user.email.toLowerCase())) continue;
  console.log(brt(o.createdAt), o.status, o.provider, o.paymentMethod, (o.totalCents / 100).toFixed(2), o.couponCode ?? "-", o.items.map((i) => i.product.slug).join(","), "conta", brt(o.user.createdAt).slice(0, 10));
}

const users = await db.user.findMany({ where: { createdAt: { gte: INI } }, select: { email: true, createdAt: true } });
console.log("\n== Cadastros desde 15/11 (sem excluídos):", users.filter((u) => !excl.has(u.email.toLowerCase())).length);
const cadDia = new Map<string, number>();
for (const u of users) { if (excl.has(u.email.toLowerCase())) continue; const d = brt(u.createdAt).slice(0, 10); cadDia.set(d, (cadDia.get(d) ?? 0) + 1); }
console.log([...cadDia].sort().map(([d, n]) => `${d}=${n}`).join(" "));

// Base: pedidos pagos por mês
const pagos = await db.order.findMany({ where: { status: "PAID", paidAt: { gte: new Date("2026-08-01T03:00:00Z") } }, include: { user: { select: { email: true } }, items: { include: { product: { select: { slug: true } } } } } });
const mes = new Map<string, { n: number; r: number; anual: number }>();
for (const o of pagos) { if (excl.has(o.user.email.toLowerCase())) continue; const m = brt(o.paidAt!).slice(0, 7); const x = mes.get(m) ?? { n: 0, r: 0, anual: 0 }; x.n++; x.r += o.totalCents; if (o.items.some((i) => i.product.slug.includes("anual"))) x.anual++; mes.set(m, x); }
console.log("\n== Pagos por mês:", [...mes].sort().map(([m, x]) => `${m}: ${x.n} (R$ ${(x.r / 100).toFixed(0)}, anual ${x.anual})`).join(" | "));

// Base quente: assinaturas
const subs = await db.subscription.groupBy({ by: ["status"], _count: true });
console.log("\n== Subscriptions por status:", subs.map((s) => `${s.status}=${s._count}`).join(" "));

// Logados que viram páginas de venda/checkout na semana
const pv = await db.pageView.findMany({ where: { createdAt: { gte: new Date("2026-11-23T03:00:00Z") }, NOT: { userId: { startsWith: "anon_" } }, OR: [{ path: { startsWith: "/checkout" } }, { path: { startsWith: "/black-week" } }, { path: { startsWith: "/assinatura" } }] }, select: { userId: true, path: true } });
console.log("\n== Logados em /checkout|/black-week|/assinatura desde 23/11:", new Set(pv.map((p) => p.userId)).size, [...new Set(pv.map((p) => p.path))].slice(0, 15).join(" "));
const ativos = await db.pageView.findMany({ where: { createdAt: { gte: new Date("2026-11-23T03:00:00Z") }, NOT: { userId: { startsWith: "anon_" } } }, select: { userId: true }, distinct: ["userId"] });
console.log("logados ativos na plataforma desde 23/11:", ativos.length);
await db.$disconnect();
