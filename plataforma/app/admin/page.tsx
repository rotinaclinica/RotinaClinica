export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { ExportPdfButton } from "./_components/ExportPdfButton";
import type { PdfReportData } from "./_components/pdf-generator";
import { getExcludedEmails } from "./_lib/excluded-emails";

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

  const EXCLUDED_EMAILS = await getExcludedEmails();
  const notTest = { email: { notIn: EXCLUDED_EMAILS } };
  const notTestSub = { user: notTest };
  // ACTIVE no banco só vira EXPIRED quando o usuário volta a acessar (expiração
  // preguiçosa); por isso "ativo de verdade" exige também o período vigente.
  const vigente = { status: "ACTIVE" as const, currentPeriodEnd: { gt: now } };
  const last60d = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersWeek,
    subActive,
    subMonthly,
    subAnnual,
    revenueMonth,
    cancelamentosRecentes,
    renovandoLista,
    vencidosLista,
    trialAtivos,
    trialTotal,
    trialConvertidos,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: last7 } } }),
    db.subscription.count({ where: { ...vigente, ...notTestSub } }),
    db.subscription.count({ where: { ...vigente, plan: "MONTHLY", ...notTestSub } }),
    db.subscription.count({ where: { ...vigente, plan: "ANNUAL", ...notTestSub } }),
    db.order.aggregate({ where: { status: "PAID", paidAt: { gte: startOfMonth }, ...notTestSub }, _sum: { totalCents: true } }),
    db.subscription.findMany({
      where: { status: "CANCELLED", cancelledAt: { gte: last30d }, ...notTestSub },
      orderBy: { cancelledAt: "desc" },
      select: { plan: true, cancelledAt: true, user: { select: { name: true, email: true } } },
    }),
    db.subscription.findMany({
      where: { status: "ACTIVE", currentPeriodEnd: { gt: now, lte: next30 }, ...notTestSub },
      orderBy: { currentPeriodEnd: "asc" },
      select: { plan: true, currentPeriodEnd: true, asaasSubscriptionId: true, user: { select: { name: true, email: true } } },
    }),
    // Venceram nos últimos 60 dias e não renovaram — público de reconquista
    db.subscription.findMany({
      where: {
        status: { in: ["ACTIVE", "EXPIRED", "PAST_DUE"] },
        currentPeriodEnd: { gte: last60d, lte: now },
        user: { ...notTest, role: "CUSTOMER", isCourtesy: false, anonymizedAt: null },
      },
      orderBy: { currentPeriodEnd: "desc" },
      select: { plan: true, currentPeriodEnd: true, user: { select: { name: true, email: true, phone: true, lastSeenAt: true } } },
    }),
    // Teste grátis: em andamento, total que já ativou, e quantos viraram assinatura
    db.user.count({ where: { ...notTest, trialEndsAt: { gt: now } } }),
    db.user.count({ where: { ...notTest, trialStartedAt: { not: null } } }),
    db.user.count({ where: { ...notTest, trialStartedAt: { not: null }, subscription: { isNot: null } } }),
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

  const MONTH_LABELS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const reportData: PdfReportData = {
    title: "Dashboard",
    subtitle: "Visão operacional da plataforma",
    date: now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
    sections: [
      {
        type: "cards",
        title: "Resumo",
        cards: [
          { label: "Usuários", value: String(totalUsers), sub: `+${newUsersWeek} esta semana` },
          { label: "Assinantes ativos", value: String(subActive), sub: `${subMonthly} mensal · ${subAnnual} anual` },
          { label: "MRR", value: brl(mrr), sub: "receita recorrente mensal" },
          { label: "Receita este mês", value: brl(revenueMonth._sum.totalCents), sub: "pedidos pagos" },
        ],
      },
      {
        type: "cards",
        title: "Atividade em tempo real",
        cards: [
          { label: "Online agora", value: String(onlineNow), sub: "janela de 5 min" },
          { label: "Ativos — 24h", value: String(active24h), sub: "usuários únicos" },
          { label: "Ativos — 7 dias", value: String(active7d), sub: "usuários únicos" },
        ],
      },
      {
        type: "cards",
        title: "Notas fiscais",
        cards: [
          { label: "NF-e autorizadas", value: String(nfAuthorized) },
          { label: "NF-e pendentes", value: String(nfPending) },
          { label: "NF-e processando", value: String(nfProcessing) },
          { label: "NF-e com erro", value: String(nfFailed) },
        ],
      },
      ...(renovandoLista.length > 0 ? [{
        type: "table" as const,
        title: "Renovações próximas — 30 dias",
        table: {
          headers: ["Usuário", "Email", "Plano", "Renovação", "Vence em"],
          rows: renovandoLista.map((s) => [
            s.user.name ?? "—",
            s.user.email,
            s.plan === "ANNUAL" ? "Anual" : "Mensal",
            s.asaasSubscriptionId ? "Automática (cartão)" : "Manual",
            s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString("pt-BR") : "—",
          ]),
        },
      }] : []),
      ...(vencidosLista.length > 0 ? [{
        type: "table" as const,
        title: "Vencidas sem renovação — 60 dias",
        table: {
          headers: ["Usuário", "Email", "Telefone", "Plano", "Venceu em"],
          rows: vencidosLista.map((s) => [
            s.user.name ?? "—",
            s.user.email,
            s.user.phone ?? "—",
            s.plan === "ANNUAL" ? "Anual" : "Mensal",
            new Date(s.currentPeriodEnd).toLocaleDateString("pt-BR"),
          ]),
        },
      }] : []),
      ...(cancelamentosRecentes.length > 0 ? [{
        type: "table" as const,
        title: "Cancelamentos recentes — 30 dias",
        table: {
          headers: ["Usuário", "Email", "Plano", "Cancelado em"],
          rows: cancelamentosRecentes.map((s) => [
            s.user.name ?? "—",
            s.user.email,
            s.plan === "ANNUAL" ? "Anual" : "Mensal",
            s.cancelledAt ? new Date(s.cancelledAt).toLocaleDateString("pt-BR") : "—",
          ]),
        },
      }] : []),
    ],
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Painel Admin</h1>
          <p className="text-sm text-zinc-400 mt-1">Visão operacional da plataforma</p>
        </div>
        <ExportPdfButton label="Relatório PDF" reportData={reportData} />
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

      {/* ── Teste grátis ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">Teste grátis (7 dias)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Tile label="Em teste agora" value={trialAtivos} />
          <Tile label="Já testaram" value={trialTotal} sub="desde o início" />
          <Tile
            label="Viraram assinantes"
            value={trialConvertidos}
            color="green"
            sub={trialTotal > 0 ? `${Math.round((trialConvertidos / trialTotal) * 100)}% de conversão` : "—"}
          />
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
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[450px]">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Usuário</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Plano</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Renovação</th>
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
                    <td className="px-4 py-3 text-xs">
                      {s.asaasSubscriptionId
                        ? <span className="text-emerald-400">Automática (cartão)</span>
                        : <span className="text-amber-300">Manual (Pix/avulso)</span>}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-amber-400">
                      {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString("pt-BR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </section>
      )}

      {/* ── Vencidas sem renovação ── */}
      {vencidosLista.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-1">
            Vencidas sem renovação — 60 dias ({vencidosLista.length})
          </h2>
          <p className="text-xs text-zinc-400 mb-3">Recebem lembretes automáticos em D+3, D+7 e D+15. Vale um contato direto.</p>
          <div className="bg-[#161b22] rounded-xl border border-white/10 border-l-4 border-l-red-400 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Usuário</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Plano</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Venceu em</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Último acesso</th>
                </tr>
              </thead>
              <tbody>
                {vencidosLista.map((s, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-100">{s.user.name ?? "—"}</p>
                      <p className="text-xs text-zinc-400">{s.user.email}</p>
                      {s.user.phone && (
                        <a href={whatsappUrl(s.user.phone)} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline">
                          WhatsApp · {s.user.phone}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {s.plan === "ANNUAL" ? "Anual" : "Mensal"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-medium text-red-400">{new Date(s.currentPeriodEnd).toLocaleDateString("pt-BR")}</p>
                      <p className="text-zinc-500">há {Math.max(0, Math.floor((now.getTime() - new Date(s.currentPeriodEnd).getTime()) / 86_400_000))} dia(s)</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">
                      {s.user.lastSeenAt ? new Date(s.user.lastSeenAt).toLocaleDateString("pt-BR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
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
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[450px]">
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

// Link wa.me a partir do telefone salvo (com ou sem DDI 55)
function whatsappUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.length <= 11 ? "55" + digits : digits}`;
}
