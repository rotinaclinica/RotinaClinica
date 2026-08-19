export const dynamic = "force-dynamic";

import { db } from "@/lib/db";

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
  const startOfMonth  = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear   = new Date(now.getFullYear(), 0, 1);
  const last7         = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const next30        = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const fiveMinAgo    = new Date(now.getTime() - 5 * 60 * 1000);

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
    revenueWeek,
    ordersTotal,
    reembolsosAggregate,
    cancelamentosRecentes,
    ordersNaoConcluidos,
    renovandoLista,
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
    db.order.aggregate({ where: { status: "PAID", paidAt: { gte: last7 } }, _sum: { totalCents: true } }),
    db.order.count({ where: { status: "PAID" } }),
    db.order.aggregate({ where: { status: "REFUNDED" }, _sum: { totalCents: true }, _count: true }),
    db.subscription.findMany({
      where: { status: "CANCELLED", cancelledAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
      orderBy: { cancelledAt: "desc" },
      select: { plan: true, cancelledAt: true, user: { select: { name: true, email: true } } },
    }),
    db.order.count({ where: { status: { in: ["EXPIRED", "FAILED"] } } }),
    db.subscription.findMany({
      where: { status: "ACTIVE", currentPeriodEnd: { lte: next30 } },
      orderBy: { currentPeriodEnd: "asc" },
      select: { plan: true, currentPeriodEnd: true, user: { select: { name: true, email: true } } },
    }),
  ]);

  // Queries that depend on the new schema (lastSeenAt / ActivityLog).
  // Wrapped in try/catch: the running dev server may have a stale Prisma client
  // cached in globalThis — these work correctly after a server restart.
  let onlineNow = 0;
  let recentActivity: { createdAt: Date }[] = [];
  try {
    [onlineNow, recentActivity] = await Promise.all([
      db.user.count({ where: { lastSeenAt: { gte: fiveMinAgo } } }),
      db.activityLog.findMany({ where: { createdAt: { gte: last7 } }, select: { createdAt: true } }),
    ]);
  } catch {
    // stale client — values remain 0 / []
  }

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

      {/* ── Atividade em Tempo Real ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Atividade em Tempo Real</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Online agora */}
          <div className="bg-white rounded-xl border border-zinc-200 p-4 border-l-4 border-l-emerald-400">
            <p className="text-xs text-zinc-500 mb-1">Online agora</p>
            <p className="text-4xl font-bold text-zinc-900">{onlineNow}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {onlineNow === 1 ? "usuário ativo" : "usuários ativos"} · janela de 5 min
            </p>
          </div>

          {/* Gráfico de horários de pico */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 p-4">
            <p className="text-xs text-zinc-500 mb-3">Horários de pico — últimos 7 dias</p>
            <PeakHoursChart logs={recentActivity} />
          </div>
        </div>
      </section>

      {/* ── Receita ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Receita</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Tile label="Total (all time)"   value={brl(revenueTotal._sum.totalCents)} color="green" sub={`${ordersTotal} vendas confirmadas`} />
          <Tile label="Últimos 7 dias"    value={brl(revenueWeek._sum.totalCents)} />
          <Tile label="Este mês"          value={brl(revenueMonth._sum.totalCents)} />
          <Tile label="Este ano"          value={brl(revenueYear._sum.totalCents)} />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Tile label="Receita via Stripe"       value={brl(revenueStripe._sum.totalCents)} sub="gateway internacional" />
          <Tile label="Receita via Mercado Pago" value={brl(revenueMp._sum.totalCents)}    sub="gateway nacional" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Tile label="Total reembolsado" value={brl(reembolsosAggregate._sum.totalCents)} color="red" sub={`${reembolsosAggregate._count} reembolso${reembolsosAggregate._count !== 1 ? "s" : ""}`} />
          <Tile label="Ticket médio" value={ordersTotal ? brl(Math.round((revenueTotal._sum.totalCents ?? 0) / ordersTotal)) : "—"} sub="por pedido pago" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Tile
            label="Conversão de checkout"
            value={pct(ordersTotal, ordersTotal + ordersNaoConcluidos)}
            sub={`${ordersNaoConcluidos} checkout${ordersNaoConcluidos !== 1 ? "s" : ""} abandonado${ordersNaoConcluidos !== 1 ? "s" : ""}`}
          />
          <Tile
            label="Taxa de reembolso"
            value={pct(reembolsosAggregate._count, ordersTotal)}
            color={reembolsosAggregate._count > 0 ? "red" : undefined}
            sub={`${reembolsosAggregate._count} de ${ordersTotal} pedidos pagos`}
          />
        </div>
      </section>

      {/* ── Renovações Próximas ── */}
      {renovandoLista.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
            Renovações próximas — próximos 30 dias
          </h2>
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-500">Usuário</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-500">Plano</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-500">Vence em</th>
                </tr>
              </thead>
              <tbody>
                {renovandoLista.map((s, i) => (
                  <tr key={i} className="border-b border-zinc-50 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-800">{s.user.name ?? "—"}</p>
                      <p className="text-xs text-zinc-400">{s.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 text-xs">
                      {s.plan === "ANNUAL" ? "Anual" : "Mensal"}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-amber-600">
                      {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString("pt-BR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Cancelamentos Recentes ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
          Cancelamentos recentes — últimos 30 dias
        </h2>
        {cancelamentosRecentes.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-5 text-sm text-zinc-400">
            Nenhum cancelamento registrado nos últimos 30 dias.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-500">Usuário</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-500">Plano</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-500">Cancelado em</th>
                </tr>
              </thead>
              <tbody>
                {cancelamentosRecentes.map((s, i) => (
                  <tr key={i} className="border-b border-zinc-50 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-800">{s.user.name ?? "—"}</p>
                      <p className="text-xs text-zinc-400">{s.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 text-xs">
                      {s.plan === "ANNUAL" ? "Anual" : "Mensal"}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {s.cancelledAt ? new Date(s.cancelledAt).toLocaleDateString("pt-BR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}

function PeakHoursChart({ logs }: { logs: { createdAt: Date }[] }) {
  const counts = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: logs.filter((l) => new Date(l.createdAt).getHours() === h).length,
  }));
  const max = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div className="flex items-end gap-0.5 h-16">
      {counts.map(({ hour, count }) => (
        <div key={hour} className="flex-1 flex flex-col items-center gap-0.5" title={`${hour}h: ${count} pings`}>
          <div
            className="w-full rounded-t bg-violet-400"
            style={{ height: `${Math.round((count / max) * 56)}px`, minHeight: count > 0 ? "2px" : "0" }}
          />
          {hour % 6 === 0 && (
            <span className="text-[8px] text-zinc-400 leading-none">{hour}h</span>
          )}
        </div>
      ))}
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
