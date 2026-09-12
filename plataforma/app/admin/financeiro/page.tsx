export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { BarChart } from "../BarChart";
import { ExportPdfButton } from "../_components/ExportPdfButton";
import type { PdfReportData } from "../_components/pdf-generator";
import { CostForm } from "./cost-form";
import { DeleteCostButton } from "./delete-button";

export const metadata = { title: "Financeiro · Admin" };

function brl(cents: number | null) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    (cents ?? 0) / 100
  );
}

function estimateGatewayFee(provider: string, paymentMethod: string | null, totalCents: number): number {
  const method = (paymentMethod ?? "").toLowerCase();
  if (provider === "ASAAS") {
    if (method.includes("pix")) return Math.max(50, Math.round(totalCents * 0.0099));
    if (method.includes("boleto")) return 399;
    return Math.round(totalCents * 0.0299);
  }
  if (provider === "STRIPE") return Math.round(totalCents * 0.0399) + 39;
  if (provider === "MERCADOPAGO") return Math.round(totalCents * 0.0499);
  return Math.round(totalCents * 0.03);
}

export default async function FinanceiroPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    ordersAllTime,
    ordersThisMonth,
    ordersLastMonth,
    refundTotal,
    refundThisMonth,
    costsThisMonth,
    costsLastMonth,
    costsAll,
    recentCosts,
    subsMonthly,
    subsAnnual,
  ] = await Promise.all([
    db.order.findMany({
      where: { status: "PAID" },
      select: { provider: true, paymentMethod: true, totalCents: true, paidAt: true },
    }),
    db.order.findMany({
      where: { status: "PAID", paidAt: { gte: startOfMonth } },
      select: { provider: true, paymentMethod: true, totalCents: true },
    }),
    db.order.findMany({
      where: { status: "PAID", paidAt: { gte: startOfLastMonth, lt: startOfMonth } },
      select: { provider: true, paymentMethod: true, totalCents: true },
    }),
    db.order.aggregate({ where: { status: "REFUNDED" }, _sum: { totalCents: true }, _count: true }),
    db.order.aggregate({ where: { status: "REFUNDED", createdAt: { gte: startOfMonth } }, _sum: { totalCents: true }, _count: true }),
    db.financialCost.findMany({ where: { referenceMonth: startOfMonth } }),
    db.financialCost.findMany({ where: { referenceMonth: startOfLastMonth } }),
    db.financialCost.findMany({ where: { referenceMonth: { gte: sixMonthsAgo } }, orderBy: { referenceMonth: "asc" } }),
    db.financialCost.findMany({ orderBy: { referenceMonth: "desc" }, take: 30 }),
    db.subscription.count({ where: { status: "ACTIVE", plan: "MONTHLY" } }),
    db.subscription.count({ where: { status: "ACTIVE", plan: "ANNUAL" } }),
  ]);

  // Revenue calculations
  const grossAllTime = ordersAllTime.reduce((s, o) => s + o.totalCents, 0);
  const feesAllTime = ordersAllTime.reduce((s, o) => s + estimateGatewayFee(o.provider, o.paymentMethod, o.totalCents), 0);
  const refundsAllTime = refundTotal._sum.totalCents ?? 0;

  const grossMonth = ordersThisMonth.reduce((s, o) => s + o.totalCents, 0);
  const feesMonth = ordersThisMonth.reduce((s, o) => s + estimateGatewayFee(o.provider, o.paymentMethod, o.totalCents), 0);
  const refundsMonth = refundThisMonth._sum.totalCents ?? 0;

  const grossLastMonth = ordersLastMonth.reduce((s, o) => s + o.totalCents, 0);
  const feesLastMonth = ordersLastMonth.reduce((s, o) => s + estimateGatewayFee(o.provider, o.paymentMethod, o.totalCents), 0);

  // Subscription revenue
  const mrrMonthly = subsMonthly * 3990;
  const mrrAnnual = Math.round(subsAnnual * 40000 / 12);
  const mrr = mrrMonthly + mrrAnnual;
  const subsTotal = subsMonthly + subsAnnual;

  // Costs
  const totalCostsMonth = costsThisMonth.reduce((s, c) => s + c.amountCents, 0);
  const totalCostsLastMonth = costsLastMonth.reduce((s, c) => s + c.amountCents, 0);

  // Net profit
  const netRevenueMonth = grossMonth - feesMonth - refundsMonth;
  const profitMonth = netRevenueMonth - totalCostsMonth;

  const netRevenueLastMonth = grossLastMonth - feesLastMonth;
  const profitLastMonth = netRevenueLastMonth - totalCostsLastMonth;

  const profitChange = profitLastMonth ? ((profitMonth - profitLastMonth) / Math.abs(profitLastMonth) * 100).toFixed(1) : null;

  // Category breakdown this month
  const categoryMap = new Map<string, number>();
  for (const c of costsThisMonth) {
    categoryMap.set(c.category, (categoryMap.get(c.category) ?? 0) + c.amountCents);
  }

  const CATEGORY_LABELS: Record<string, string> = {
    fixo: "Fixo mensal",
    trafego: "Tráfego pago",
    parceria: "Parceria",
    software: "Software",
    outros: "Outros",
  };

  // Monthly profit chart (6 months)
  const MONTH_LABELS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const profitBars = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const yr = d.getFullYear();
    const mo = d.getMonth();
    const mStart = new Date(yr, mo, 1);
    const mEnd = new Date(yr, mo + 1, 1);

    const mGross = ordersAllTime
      .filter((o) => o.paidAt && o.paidAt >= mStart && o.paidAt < mEnd)
      .reduce((s, o) => s + o.totalCents, 0);
    const mFees = ordersAllTime
      .filter((o) => o.paidAt && o.paidAt >= mStart && o.paidAt < mEnd)
      .reduce((s, o) => s + estimateGatewayFee(o.provider, o.paymentMethod, o.totalCents), 0);
    const mCosts = costsAll
      .filter((c) => {
        const ref = new Date(c.referenceMonth);
        return ref.getFullYear() === yr && ref.getMonth() === mo;
      })
      .reduce((s, c) => s + c.amountCents, 0);

    return {
      label: MONTH_LABELS[mo],
      value: mGross - mFees - mCosts,
      current: yr === now.getFullYear() && mo === now.getMonth(),
    };
  });

  // Build PDF report data
  const monthLabel = `${MONTH_LABELS[now.getMonth()]} ${now.getFullYear()}`;
  const reportData: PdfReportData = {
    title: "Financeiro",
    subtitle: "Receitas, custos e lucro líquido",
    date: now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
    sections: [
      {
        type: "cards",
        title: `Resumo — ${monthLabel}`,
        cards: [
          { label: "Receita bruta", value: brl(grossMonth), sub: `${ordersThisMonth.length} vendas` },
          { label: "Taxas gateway", value: brl(feesMonth), sub: "estimativa" },
          { label: "Receita líquida", value: brl(netRevenueMonth), sub: "após taxas e reembolsos" },
          { label: "Custos operacionais", value: brl(totalCostsMonth), sub: `${costsThisMonth.length} itens` },
          { label: "Lucro líquido", value: brl(profitMonth), sub: profitChange ? `${Number(profitChange) >= 0 ? "+" : ""}${profitChange}% vs mês anterior` : "primeiro mês" },
        ],
      },
      {
        type: "cards",
        title: "Receita recorrente (MRR)",
        cards: [
          { label: "MRR total", value: brl(mrr), sub: `${subsTotal} assinantes ativos` },
          { label: `Plano Mensal (${subsMonthly})`, value: brl(mrrMonthly), sub: `${subsMonthly} × R$ 39,90/mês` },
          { label: `Plano Anual (${subsAnnual})`, value: brl(mrrAnnual), sub: `${subsAnnual} × R$ 400/ano (R$ 33,33/mês)` },
        ],
      },
      {
        type: "kv",
        title: "DRE simplificado — acumulado",
        rows: [
          { label: "Receita bruta", value: brl(grossAllTime), bold: true },
          { label: "(−) Taxas de gateway", value: brl(-feesAllTime), color: "red" },
          { label: "(−) Reembolsos", value: brl(-refundsAllTime), color: "red" },
          { label: "Receita líquida", value: brl(grossAllTime - feesAllTime - refundsAllTime), bold: true },
          { label: "(−) Custos operacionais", value: brl(-(costsAll.reduce((s, c) => s + c.amountCents, 0))), color: "red" },
          { label: "Lucro líquido", value: brl(grossAllTime - feesAllTime - refundsAllTime - costsAll.reduce((s, c) => s + c.amountCents, 0)), bold: true, color: (grossAllTime - feesAllTime - refundsAllTime - costsAll.reduce((s, c) => s + c.amountCents, 0)) >= 0 ? "green" : "red" },
        ],
      },
      ...(costsThisMonth.length > 0 ? [{
        type: "table" as const,
        title: `Custos — ${monthLabel}`,
        table: {
          headers: ["Nome", "Categoria", "Tipo", "Valor"],
          rows: costsThisMonth.sort((a, b) => b.amountCents - a.amountCents).map((c) => [
            c.name,
            CATEGORY_LABELS[c.category] ?? c.category,
            c.recurring ? "Recorrente" : "Pontual",
            brl(c.amountCents),
          ]),
        },
      }] : []),
    ],
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Financeiro</h1>
          <p className="text-sm text-zinc-400 mt-1">Receitas, custos e lucro líquido</p>
        </div>
        <ExportPdfButton label="Relatório PDF" reportData={reportData} />
      </div>

      {/* ── Resumo do Mês ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">
          {monthLabel}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Tile label="Receita bruta" value={brl(grossMonth)} sub={`${ordersThisMonth.length} venda${ordersThisMonth.length !== 1 ? "s" : ""}`} />
          <Tile label="Taxas gateway" value={brl(feesMonth)} color="red" sub="estimativa" />
          <Tile label="Receita líquida" value={brl(netRevenueMonth)} sub="após taxas e reembolsos" />
          <Tile label="Custos operacionais" value={brl(totalCostsMonth)} color="red" sub={`${costsThisMonth.length} item${costsThisMonth.length !== 1 ? "ns" : ""}`} />
          <Tile
            label="Lucro líquido"
            value={brl(profitMonth)}
            color={profitMonth > 0 ? "green" : "red"}
            sub={profitChange ? `${Number(profitChange) >= 0 ? "+" : ""}${profitChange}% vs mês anterior` : "primeiro mês"}
          />
        </div>
      </section>

      {/* ── Receita Recorrente por Plano ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">Receita recorrente (MRR)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <Tile label="MRR total" value={brl(mrr)} color="green" sub={`${subsTotal} assinantes ativos`} />
          <div className="bg-[#161b22] rounded-xl border border-white/10 p-4 border-l-4 border-l-amber-400">
            <p className="text-xs text-zinc-400 mb-1">Plano Mensal</p>
            <p className="text-2xl font-bold text-zinc-100">{brl(mrrMonthly)}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{subsMonthly} assinante{subsMonthly !== 1 ? "s" : ""} × R$ 39,90/mês</p>
          </div>
          <div className="bg-[#161b22] rounded-xl border border-white/10 p-4 border-l-4 border-l-indigo-400">
            <p className="text-xs text-zinc-400 mb-1">Plano Anual</p>
            <p className="text-2xl font-bold text-zinc-100">{brl(mrrAnnual)}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{subsAnnual} assinante{subsAnnual !== 1 ? "s" : ""} × R$ 400/ano (R$ 33,33/mês)</p>
          </div>
        </div>
      </section>

      {/* ── Detalhamento de Custos ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">Custos do mês</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[#161b22] rounded-xl border border-white/10 p-5">
            <p className="text-xs text-zinc-400 mb-3">Por categoria</p>
            {categoryMap.size === 0 ? (
              <p className="text-sm text-zinc-500">Nenhum custo cadastrado neste mês.</p>
            ) : (
              <div className="space-y-2">
                {Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]).map(([cat, cents]) => (
                  <div key={cat} className="flex justify-between items-center">
                    <span className="text-sm text-zinc-300">{CATEGORY_LABELS[cat] ?? cat}</span>
                    <span className="text-sm font-medium text-zinc-100">{brl(cents)}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                  <span className="text-sm font-semibold text-zinc-200">Total</span>
                  <span className="text-sm font-bold text-zinc-100">{brl(totalCostsMonth)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#161b22] rounded-xl border border-white/10 p-5">
            <p className="text-xs text-zinc-400 mb-3">Itens</p>
            {costsThisMonth.length === 0 ? (
              <p className="text-sm text-zinc-500">Nenhum custo este mês.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {costsThisMonth.sort((a, b) => b.amountCents - a.amountCents).map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm text-zinc-100">{c.name}</p>
                      <p className="text-[10px] text-zinc-500">
                        {CATEGORY_LABELS[c.category] ?? c.category}
                        {c.recurring && " · recorrente"}
                        {c.note && ` · ${c.note}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-zinc-100">{brl(c.amountCents)}</span>
                      <DeleteCostButton id={c.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Gráfico Lucro Mensal ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">Lucro líquido mensal</h2>
        <BarChart
          title="Lucro líquido — últimos 6 meses (R$)"
          bars={profitBars}
        />
      </section>

      {/* ── DRE Simplificado ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">DRE simplificado — acumulado</h2>
        <div className="bg-[#161b22] rounded-xl border border-white/10 p-5">
          <div className="space-y-2 text-sm">
            <DRERow label="Receita bruta" value={grossAllTime} bold />
            <DRERow label="(−) Taxas de gateway" value={-feesAllTime} color="red" />
            <DRERow label="(−) Reembolsos" value={-refundsAllTime} color="red" />
            <div className="border-t border-white/10 my-2" />
            <DRERow label="Receita líquida" value={grossAllTime - feesAllTime - refundsAllTime} bold />
            <DRERow label="(−) Custos operacionais" value={-(costsAll.reduce((s, c) => s + c.amountCents, 0))} color="red" />
            <div className="border-t border-white/10 my-2" />
            <DRERow
              label="Lucro líquido"
              value={grossAllTime - feesAllTime - refundsAllTime - costsAll.reduce((s, c) => s + c.amountCents, 0)}
              bold
              highlight
            />
          </div>
          <p className="text-[10px] text-zinc-500 mt-3">
            Taxas estimadas: Pix ~0.99% · Cartão ~2.99% · Boleto ~R$3.99 · Stripe ~3.99%+R$0.39 · MP ~4.99%
          </p>
        </div>
      </section>

      {/* ── Adicionar Custo ── */}
      <section className="print:hidden">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">Gerenciar custos</h2>
        <CostForm />
      </section>

      {/* ── Histórico de Custos ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">Histórico de custos</h2>
        <div className="bg-[#161b22] rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Mês</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Nome</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Categoria</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400">Valor</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {recentCosts.map((c) => (
                <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {new Date(c.referenceMonth).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-zinc-100">
                    {c.name}
                    {c.recurring && <span className="ml-1.5 text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded">recorrente</span>}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{CATEGORY_LABELS[c.category] ?? c.category}</td>
                  <td className="px-4 py-3 text-right text-zinc-100 font-medium">{brl(c.amountCents)}</td>
                  <td className="px-4 py-3 text-right">
                    <DeleteCostButton id={c.id} />
                  </td>
                </tr>
              ))}
              {recentCosts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                    Nenhum custo cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
    <div className={`bg-[#161b22] rounded-xl border border-white/10 p-4 ${accent}`}>
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
      {sub && <p className="text-[11px] text-zinc-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function DRERow({
  label,
  value,
  bold,
  color,
  highlight,
}: {
  label: string;
  value: number;
  bold?: boolean;
  color?: "red" | "green";
  highlight?: boolean;
}) {
  const textColor =
    highlight ? (value >= 0 ? "text-emerald-300" : "text-red-400") :
    color === "red" ? "text-red-400" :
    color === "green" ? "text-emerald-300" :
    "text-zinc-100";

  return (
    <div className={`flex justify-between items-center ${highlight ? "bg-white/5 -mx-2 px-2 py-1.5 rounded-lg" : ""}`}>
      <span className={`${bold ? "font-semibold text-zinc-100" : "text-zinc-300"}`}>{label}</span>
      <span className={`font-medium ${textColor} ${bold ? "font-bold" : ""}`}>{brl(value)}</span>
    </div>
  );
}
