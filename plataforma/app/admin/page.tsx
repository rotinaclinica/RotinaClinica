export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Admin · Rotina Clínica" };

function brl(cents: number | null) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    (cents ?? 0) / 100
  );
}

function pct(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export default async function AdminPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear  = new Date(now.getFullYear(), 0, 1);
  const last7        = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const next30       = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersWeek,
    subActive,
    subMonthly,
    subAnnual,
    subCancelled,
    subExpired,
    subPastDue,
    renewingSoon,
    revenueTotal,
    revenueMonth,
    revenueYear,
    revenueStripe,
    revenueMp,
    ordersPending,
    ordersTotal,
    recentOrders,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: last7 } } }),
    db.subscription.count({ where: { status: "ACTIVE" } }),
    db.subscription.count({ where: { status: "ACTIVE", plan: "MONTHLY" } }),
    db.subscription.count({ where: { status: "ACTIVE", plan: "ANNUAL" } }),
    db.subscription.count({ where: { status: "CANCELLED" } }),
    db.subscription.count({ where: { status: "EXPIRED" } }),
    db.subscription.count({ where: { status: "PAST_DUE" } }),
    db.subscription.count({
      where: { status: "ACTIVE", currentPeriodEnd: { lte: next30 } },
    }),
    db.order.aggregate({ where: { status: "PAID" }, _sum: { totalCents: true } }),
    db.order.aggregate({ where: { status: "PAID", paidAt: { gte: startOfMonth } }, _sum: { totalCents: true } }),
    db.order.aggregate({ where: { status: "PAID", paidAt: { gte: startOfYear } }, _sum: { totalCents: true } }),
    db.order.aggregate({ where: { status: "PAID", provider: "STRIPE" }, _sum: { totalCents: true } }),
    db.order.aggregate({ where: { status: "PAID", provider: "MERCADOPAGO" }, _sum: { totalCents: true } }),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: "PAID" } }),
    db.order.findMany({
      where: { status: "PAID" },
      orderBy: { paidAt: "desc" },
      take: 8,
      include: { user: { select: { email: true, name: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Painel Admin</h1>
        <p className="text-sm text-zinc-500 mt-1">Visão geral da plataforma</p>
      </div>

      {/* ── Usuários & Assinantes ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Usuários & Assinantes</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Tile label="Usuários cadastrados" value={totalUsers} sub={`+${newUsersWeek} nos últimos 7 dias`} />
          <Tile label="Assinantes ativos" value={subActive} color="green" />
          <Tile label="Plano Mensal" value={subMonthly} sub={pct(subMonthly, subActive) + " dos ativos"} />
          <Tile label="Plano Anual" value={subAnnual}  sub={pct(subAnnual, subActive) + " dos ativos"} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <Tile label="Cancelados" value={subCancelled} color="red" />
          <Tile label="Expirados"  value={subExpired}   color="red" />
          <Tile label="Em atraso"  value={subPastDue}   color="yellow" />
          <Tile label="Renovando em 30 dias" value={renewingSoon} color="yellow" sub="assinaturas ativas" />
        </div>
      </section>

      {/* ── Receita ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Receita</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Tile label="Total (all time)"  value={brl(revenueTotal._sum.totalCents)} color="green" sub={`${ordersTotal} vendas confirmadas`} />
          <Tile label="Este mês"          value={brl(revenueMonth._sum.totalCents)} />
          <Tile label="Este ano"          value={brl(revenueYear._sum.totalCents)} />
          <Tile label="Pedidos pendentes" value={ordersPending} color={ordersPending > 0 ? "yellow" : undefined} />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Tile label="Receita via Stripe"       value={brl(revenueStripe._sum.totalCents)} sub="gateway internacional" />
          <Tile label="Receita via Mercado Pago" value={brl(revenueMp._sum.totalCents)}    sub="gateway nacional" />
        </div>
      </section>

      {/* ── Vendas recentes ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Vendas recentes</h2>
          <Link href="/admin/pedidos" className="text-xs text-violet-600 hover:underline">Ver todos →</Link>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-500">Usuário</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-500">Gateway</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-500">Valor</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-500">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-2.5 text-zinc-700">{o.user?.name || o.user?.email || "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      o.provider === "STRIPE" ? "bg-indigo-100 text-indigo-700" : "bg-sky-100 text-sky-700"
                    }`}>
                      {o.provider === "STRIPE" ? "Stripe" : "Mercado Pago"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-zinc-900">{brl(o.totalCents)}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-xs">
                    {o.paidAt ? new Date(o.paidAt).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-zinc-400 text-sm">Nenhuma venda ainda</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Ações rápidas ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Ações rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/produtos/novo" className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors">
            + Novo produto
          </Link>
          <Link href="/admin/pedidos" className="border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-100 transition-colors">
            Pedidos
          </Link>
          <Link href="/admin/acessos" className="border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-100 transition-colors">
            Gerenciar acessos
          </Link>
          <Link href="/admin/produtos" className="border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-100 transition-colors">
            Produtos
          </Link>
        </div>
      </section>
    </div>
  );
}

function Tile({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "green" | "red" | "yellow";
}) {
  const accent =
    color === "green"  ? "border-l-4 border-l-emerald-400" :
    color === "red"    ? "border-l-4 border-l-red-400" :
    color === "yellow" ? "border-l-4 border-l-amber-400" :
    "";

  return (
    <div className={`bg-white rounded-xl border border-zinc-200 p-4 ${accent}`}>
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-zinc-900">{value}</p>
      {sub && <p className="text-[11px] text-zinc-400 mt-0.5">{sub}</p>}
    </div>
  );
}
