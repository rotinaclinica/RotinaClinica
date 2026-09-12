export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { ExportPdfButton } from "./_components/ExportPdfButton";

export const metadata = { title: "Admin · Rotina Clínica" };

function brl(cents: number | null) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    (cents ?? 0) / 100
  );
}

export default async function AdminPage() {
  const now = new Date();
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const next30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersWeek,
    subActive,
    subMonthly,
    subAnnual,
    revenueMonth,
    cancelamentosRecentes,
    renovandoLista,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: last7 } } }),
    db.subscription.count({ where: { status: "ACTIVE" } }),
    db.subscription.count({ where: { status: "ACTIVE", plan: "MONTHLY" } }),
    db.subscription.count({ where: { status: "ACTIVE", plan: "ANNUAL" } }),
    db.order.aggregate({ where: { status: "PAID", paidAt: { gte: startOfMonth } }, _sum: { totalCents: true } }),
    db.subscription.findMany({
      where: { status: "CANCELLED", cancelledAt: { gte: last30d } },
      orderBy: { cancelledAt: "desc" },
      select: { plan: true, cancelledAt: true, user: { select: { name: true, email: true } } },
    }),
    db.subscription.findMany({
      where: { status: "ACTIVE", currentPeriodEnd: { lte: next30 } },
      orderBy: { currentPeriodEnd: "asc" },
      select: { plan: true, currentPeriodEnd: true, user: { select: { name: true, email: true } } },
    }),
  ]);

  let onlineNow = 0;
  let active24h = 0;
  let active7d = 0;
  try {
    [onlineNow, active24h, active7d] = await Promise.all([
      db.user.count({ where: { lastSeenAt: { gte: fiveMinAgo } } }),
      db.user.count({ where: { lastSeenAt: { gte: last24h } } }),
      db.user.count({ where: { lastSeenAt: { gte: last7 } } }),
    ]);
  } catch {}

  let nfAuthorized = 0;
  let nfPending = 0;
  let nfProcessing = 0;
  let nfFailed = 0;
  try {
    [nfAuthorized, nfPending, nfProcessing, nfFailed] = await Promise.all([
      db.invoice.count({ where: { status: "AUTHORIZED" } }),
      db.invoice.count({ where: { status: "PENDING" } }),
      db.invoice.count({ where: { status: "PROCESSING" } }),
      db.invoice.count({ where: { status: "FAILED" } }),
    ]);
  } catch {}

  let healthStatus: "ok" | "error" | "unknown" = "unknown";
  let healthDetails = "";
  try {
    const secret = process.env.CRON_SECRET;
    if (secret) {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/cron/health-check`, {
        headers: { Authorization: `Bearer ${secret}` },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        const data = await res.json();
        healthStatus = data.failures > 0 ? "error" : "ok";
        healthDetails = data.failures > 0
          ? `${data.failures} falha${data.failures !== 1 ? "s" : ""} de ${data.total}`
          : `${data.ok} arquivo${data.ok !== 1 ? "s" : ""} verificado${data.ok !== 1 ? "s" : ""}`;
      }
    }
  } catch {
    healthStatus = "unknown";
    healthDetails = "Não foi possível verificar";
  }

  const mrr = subMonthly * 3990 + Math.round(subAnnual * 40000 / 12);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Painel Admin</h1>
          <p className="text-sm text-zinc-400 mt-1">Visão operacional da plataforma</p>
        </div>
        <ExportPdfButton label="Relatório PDF" />
      </div>

      {/* ── Resumo Rápido ── */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Tile label="Usuários" value={totalUsers} sub={`+${newUsersWeek} esta semana`} />
          <Tile label="Assinantes ativos" value={subActive} color="green" sub={`${subMonthly} mensal · ${subAnnual} anual`} />
          <Tile label="MRR" value={brl(mrr)} color="green" sub="receita recorrente mensal" />
          <Tile label="Receita este mês" value={brl(revenueMonth._sum.totalCents)} sub="pedidos pagos" />
        </div>
      </section>

      {/* ── Atividade em Tempo Real ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">Atividade em tempo real</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="bg-[#161b22] rounded-xl border border-white/10 p-4 border-l-4 border-l-emerald-400">
            <p className="text-xs text-zinc-400 mb-1">Online agora</p>
            <p className="text-4xl font-bold text-zinc-100">{onlineNow}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">janela de 5 min</p>
          </div>
          <Tile label="Ativos — 24h" value={active24h} sub="usuários únicos" />
          <Tile label="Ativos — 7 dias" value={active7d} sub="usuários únicos" />
        </div>
      </section>

      {/* ── Notas Fiscais & Monitoramento ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">Notas fiscais & monitoramento</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Tile label="NF-e autorizadas" value={nfAuthorized} color="green" />
          <Tile label="NF-e pendentes" value={nfPending} color={nfPending > 0 ? "yellow" : undefined} />
          <Tile label="NF-e processando" value={nfProcessing} color={nfProcessing > 0 ? "yellow" : undefined} />
          <Tile label="NF-e com erro" value={nfFailed} color={nfFailed > 0 ? "red" : undefined} />
          <div className={`bg-[#161b22] rounded-xl border border-white/10 p-4 border-l-4 ${
            healthStatus === "ok" ? "border-l-emerald-400" :
            healthStatus === "error" ? "border-l-red-400" :
            "border-l-zinc-600"
          }`}>
            <p className="text-xs text-zinc-400 mb-1">Health Check</p>
            <p className={`text-lg font-bold ${
              healthStatus === "ok" ? "text-emerald-300" :
              healthStatus === "error" ? "text-red-400" :
              "text-zinc-400"
            }`}>
              {healthStatus === "ok" ? "Tudo OK" : healthStatus === "error" ? "Falhas" : "—"}
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{healthDetails || "ebooks e downloads"}</p>
          </div>
        </div>
      </section>

      {/* ── Renovações Próximas ── */}
      {renovandoLista.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">
            Renovações próximas — 30 dias
          </h2>
          <div className="bg-[#161b22] rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Usuário</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Plano</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Vence em</th>
                </tr>
              </thead>
              <tbody>
                {renovandoLista.map((s, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-100">{s.user.name ?? "—"}</p>
                      <p className="text-xs text-zinc-400">{s.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {s.plan === "ANNUAL" ? "Anual" : "Mensal"}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-amber-400">
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
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">
          Cancelamentos recentes — 30 dias
        </h2>
        {cancelamentosRecentes.length === 0 ? (
          <div className="bg-[#161b22] rounded-xl border border-white/10 p-5 text-sm text-zinc-400">
            Nenhum cancelamento nos últimos 30 dias.
          </div>
        ) : (
          <div className="bg-[#161b22] rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Usuário</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Plano</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Cancelado em</th>
                </tr>
              </thead>
              <tbody>
                {cancelamentosRecentes.map((s, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-100">{s.user.name ?? "—"}</p>
                      <p className="text-xs text-zinc-400">{s.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
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
