export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { BarChart } from "../BarChart";
import { PieChart } from "../PieChart";

export const metadata = { title: "Métricas · Admin" };

function brl(cents: number | null) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    (cents ?? 0) / 100
  );
}

function pct(part: number, total: number) {
  if (!total) return "0%";
  return `${((part / total) * 100).toFixed(1)}%`;
}

export default async function MetricasPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [
    totalUsers,
    usersThisMonth,
    usersLastMonth,
    users30d,
    users60to30d,
    totalSubs,
    subsActive,
    subsMonthly,
    subsAnnual,
    subsCancelled30d,
    subsCancelledTotal,
    ordersTotal,
    ordersPaid,
    ordersAbandoned,
    revenueTotal,
    revenueThisMonth,
    revenueLastMonth,
    revenue30d,
    revenue60to30d,
    revenueStripe,
    revenueMp,
    revenueAsaas,
    refundCount,
    refundTotal,
    leadsTotal,
    leadsConverted,
    leads30d,
    monthlyOrders,
    monthlyUsers,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    db.user.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    db.subscription.count(),
    db.subscription.count({ where: { status: "ACTIVE" } }),
    db.subscription.count({ where: { status: "ACTIVE", plan: "MONTHLY" } }),
    db.subscription.count({ where: { status: "ACTIVE", plan: "ANNUAL" } }),
    db.subscription.count({ where: { status: "CANCELLED", cancelledAt: { gte: thirtyDaysAgo } } }),
    db.subscription.count({ where: { status: "CANCELLED" } }),
    db.order.count(),
    db.order.count({ where: { status: "PAID" } }),
    db.order.count({ where: { status: { in: ["EXPIRED", "FAILED", "PENDING"] } } }),
    db.order.aggregate({ where: { status: "PAID" }, _sum: { totalCents: true } }),
    db.order.aggregate({ where: { status: "PAID", paidAt: { gte: startOfMonth } }, _sum: { totalCents: true } }),
    db.order.aggregate({ where: { status: "PAID", paidAt: { gte: startOfLastMonth, lt: startOfMonth } }, _sum: { totalCents: true } }),
    db.order.aggregate({ where: { status: "PAID", paidAt: { gte: thirtyDaysAgo } }, _sum: { totalCents: true } }),
    db.order.aggregate({ where: { status: "PAID", paidAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }, _sum: { totalCents: true } }),
    db.order.aggregate({ where: { status: "PAID", provider: "STRIPE" }, _sum: { totalCents: true } }),
    db.order.aggregate({ where: { status: "PAID", provider: "MERCADOPAGO" }, _sum: { totalCents: true } }),
    db.order.aggregate({ where: { status: "PAID", provider: "ASAAS" }, _sum: { totalCents: true } }),
    db.order.count({ where: { status: "REFUNDED" } }),
    db.order.aggregate({ where: { status: "REFUNDED" }, _sum: { totalCents: true } }),
    db.lead.count(),
    db.lead.count({ where: { convertedAt: { not: null } } }),
    db.lead.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.order.findMany({
      where: { status: "PAID", paidAt: { gte: twelveMonthsAgo } },
      select: { paidAt: true, totalCents: true },
    }),
    db.user.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    }),
  ]);

  // Variação mês a mês
  const revThisM = revenueThisMonth._sum.totalCents ?? 0;
  const revLastM = revenueLastMonth._sum.totalCents ?? 0;
  const revChange = revLastM ? ((revThisM - revLastM) / revLastM * 100).toFixed(1) : null;

  const usersChange = usersLastMonth ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100).toFixed(1) : null;

  // Revenue growth 30d vs prior 30d
  const rev30 = revenue30d._sum.totalCents ?? 0;
  const rev60to30 = revenue60to30d._sum.totalCents ?? 0;
  const revGrowth30 = rev60to30 ? ((rev30 - rev60to30) / rev60to30 * 100).toFixed(1) : null;

  // User growth 30d vs prior 30d
  const userGrowth30 = users60to30d ? ((users30d - users60to30d) / users60to30d * 100).toFixed(1) : null;

  // Churn rate (cancelamentos 30d / ativos no início do período)
  const activePlusChurned = subsActive + subsCancelled30d;
  const churnRate = activePlusChurned ? ((subsCancelled30d / activePlusChurned) * 100).toFixed(1) : "0.0";

  // Conversion rate (cadastro → assinatura)
  const conversionRate = totalUsers ? ((subsActive + subsCancelledTotal) / totalUsers * 100).toFixed(1) : "0.0";

  // Checkout conversion
  const checkoutConversion = ordersTotal ? ((ordersPaid / ordersTotal) * 100).toFixed(1) : "0.0";

  // Lead conversion
  const leadConversion = leadsTotal ? ((leadsConverted / leadsTotal) * 100).toFixed(1) : "0.0";

  // Ticket médio
  const ticketMedio = ordersPaid ? Math.round((revenueTotal._sum.totalCents ?? 0) / ordersPaid) : 0;

  // LTV estimado (ticket médio × taxa de renovação estimada)
  const ltvEstimado = ticketMedio * (subsActive > 0 ? Math.max(1, Math.round(subsActive / Math.max(subsCancelled30d * 12, 1))) : 1);

  // MRR (Monthly Recurring Revenue)
  const mrr = subsMonthly * 3990 + Math.round(subsAnnual * 40000 / 12);

  // Gráficos mensais
  const MONTH_LABELS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const revenueBars = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const yr = d.getFullYear();
    const mo = d.getMonth();
    const value = monthlyOrders
      .filter((o) => o.paidAt && new Date(o.paidAt).getFullYear() === yr && new Date(o.paidAt).getMonth() === mo)
      .reduce((s, o) => s + o.totalCents, 0);
    return { label: MONTH_LABELS[mo], value, current: yr === now.getFullYear() && mo === now.getMonth() };
  });

  const userBars = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const yr = d.getFullYear();
    const mo = d.getMonth();
    const value = monthlyUsers
      .filter((u) => new Date(u.createdAt).getFullYear() === yr && new Date(u.createdAt).getMonth() === mo)
      .length;
    return { label: MONTH_LABELS[mo], value, current: yr === now.getFullYear() && mo === now.getMonth() };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Métricas</h1>
        <p className="text-sm text-zinc-400 mt-1">Dados para otimizar crescimento e marketing</p>
      </div>

      {/* ── KPIs Principais ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">Indicadores-chave</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Tile label="MRR" value={brl(mrr)} color="green" sub="receita recorrente mensal" />
          <Tile label="Assinantes ativos" value={subsActive} color="green" sub={`${subsMonthly} mensal · ${subsAnnual} anual`} />
          <Tile label="Churn (30 dias)" value={`${churnRate}%`} color={Number(churnRate) > 5 ? "red" : undefined} sub={`${subsCancelled30d} cancelamento${subsCancelled30d !== 1 ? "s" : ""}`} />
          <Tile label="Ticket médio" value={brl(ticketMedio)} sub="por pedido pago" />
        </div>
      </section>

      {/* ── Funil de Conversão ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">Funil de conversão</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Tile label="Leads capturados" value={leadsTotal} sub={`+${leads30d} últimos 30 dias`} />
          <Tile label="Lead → Cadastro" value={`${leadConversion}%`} sub={`${leadsConverted} converteram`} />
          <Tile label="Cadastro → Assinante" value={`${conversionRate}%`} sub={`${totalUsers} cadastros total`} />
          <Tile label="Checkout → Pagamento" value={`${checkoutConversion}%`} color={Number(checkoutConversion) > 70 ? "green" : "yellow"} sub={`${ordersAbandoned} abandono${ordersAbandoned !== 1 ? "s" : ""}`} />
        </div>
        <div className="mt-3">
          <FunnelBar steps={[
            { label: "Leads", value: leadsTotal },
            { label: "Cadastros", value: totalUsers },
            { label: "Assinantes", value: subsActive + subsCancelledTotal },
            { label: "Ativos", value: subsActive },
          ]} />
        </div>
      </section>

      {/* ── Crescimento ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">Crescimento</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Tile
            label="Novos cadastros (30d)"
            value={users30d}
            sub={userGrowth30 ? `${Number(userGrowth30) >= 0 ? "+" : ""}${userGrowth30}% vs período anterior` : "sem comparação"}
            color={userGrowth30 && Number(userGrowth30) > 0 ? "green" : undefined}
          />
          <Tile
            label="Cadastros este mês"
            value={usersThisMonth}
            sub={usersChange ? `${Number(usersChange) >= 0 ? "+" : ""}${usersChange}% vs mês anterior` : "sem comparação"}
          />
          <Tile
            label="Receita (30d)"
            value={brl(rev30)}
            sub={revGrowth30 ? `${Number(revGrowth30) >= 0 ? "+" : ""}${revGrowth30}% vs período anterior` : "sem comparação"}
            color={revGrowth30 && Number(revGrowth30) > 0 ? "green" : undefined}
          />
          <Tile
            label="Receita este mês"
            value={brl(revThisM)}
            sub={revChange ? `${Number(revChange) >= 0 ? "+" : ""}${revChange}% vs mês anterior` : "sem comparação"}
          />
        </div>
      </section>

      {/* ── Gráficos ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">Evolução mensal</h2>
        <div className="grid grid-cols-1 gap-3">
          <BarChart title="Receita mensal — últimos 12 meses (R$)" bars={revenueBars} />
          <BarChart title="Novos cadastros — últimos 12 meses" bars={userBars} />
        </div>
      </section>

      {/* ── Receita por Gateway ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">Receita por gateway</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          <PieChart
            title="Distribuição por gateway"
            slices={[
              { label: "Stripe", value: Math.round((revenueStripe._sum.totalCents ?? 0) / 100), color: "#3b82f6" },
              { label: "Mercado Pago", value: Math.round((revenueMp._sum.totalCents ?? 0) / 100), color: "#f97316" },
              { label: "Asaas", value: Math.round((revenueAsaas._sum.totalCents ?? 0) / 100), color: "#10b981" },
            ]}
          />
          <PieChart
            title="Plano dos assinantes ativos"
            slices={[
              { label: "Anual", value: subsAnnual, color: "#6366f1" },
              { label: "Mensal", value: subsMonthly, color: "#f59e0b" },
            ]}
          />
        </div>
      </section>

      {/* ── Saúde do Negócio ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">Saúde do negócio</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Tile label="Receita total" value={brl(revenueTotal._sum.totalCents)} color="green" sub={`${ordersPaid} vendas`} />
          <Tile label="Reembolsos" value={brl(refundTotal._sum.totalCents)} color={refundCount > 0 ? "red" : undefined} sub={`${refundCount} pedido${refundCount !== 1 ? "s" : ""}`} />
          <Tile
            label="Taxa de reembolso"
            value={pct(refundCount, ordersPaid)}
            color={refundCount > 0 ? "red" : undefined}
            sub={`${refundCount} de ${ordersPaid}`}
          />
          <Tile label="LTV estimado" value={brl(ltvEstimado)} sub="lifetime value por cliente" />
        </div>
      </section>
    </div>
  );
}

function Tile({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: "green" | "red" | "yellow" }) {
  const accent =
    color === "green"  ? "border-l-4 border-l-emerald-400" :
    color === "red"    ? "border-l-4 border-l-red-400" :
    color === "yellow" ? "border-l-4 border-l-amber-400" :
    "";
  return (
    <div className={`bg-[#161b22] rounded-xl border border-white/10 p-4 ${accent}`}>
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
      {sub && <p className="text-[11px] text-zinc-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function FunnelBar({ steps }: { steps: { label: string; value: number }[] }) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  return (
    <div className="bg-[#161b22] rounded-xl border border-white/10 p-5">
      <div className="space-y-3">
        {steps.map((step, i) => {
          const width = Math.max(8, (step.value / max) * 100);
          const colors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-teal-400"];
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-300 font-medium">{step.label}</span>
                <span className="text-xs text-zinc-400 font-bold">{step.value}</span>
              </div>
              <div className="h-6 bg-white/5 rounded-md overflow-hidden">
                <div
                  className={`h-full ${colors[i % colors.length]} rounded-md transition-all`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
