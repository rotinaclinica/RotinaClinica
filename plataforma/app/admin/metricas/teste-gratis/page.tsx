export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { getExcludedEmails } from "../../_lib/excluded-emails";
import MetricasTabs from "../_components/MetricasTabs";
import { TRIAL_DAYS } from "@/lib/subscription";

export const metadata = { title: "Teste grátis · Métricas · Admin" };

const DAY = 86_400_000;
const TZ = "America/Sao_Paulo";

// Seções liberadas no teste (mesma ordem de TRIAL_ROUTES)
const SECTIONS = [
  { prefix: "/dashboard/prescricoes", label: "Condutas", color: "bg-sky-500" },
  { prefix: "/dashboard/evolucoes", label: "Evoluções", color: "bg-violet-500" },
  { prefix: "/dashboard/calculadoras", label: "Calculadoras", color: "bg-emerald-500" },
];

// Emails da sequência do teste (cron drip-emails)
const TRIAL_EMAILS = [
  { step: 401, label: "D1" },
  { step: 405, label: "D5" },
  { step: 407, label: "Fim" },
  { step: 410, label: "+3d" },
];

// "Usou de verdade" = acessou o conteúdo em pelo menos 2 dias diferentes
const ENGAGED_MIN_DAYS = 2;

function sectionOf(path: string) {
  return SECTIONS.find((s) => path === s.prefix || path.startsWith(s.prefix + "/"));
}

function dayKey(d: Date) {
  return d.toLocaleDateString("pt-BR", { timeZone: TZ });
}

function fmtDate(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit" });
}

function fmtDateTime(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleString("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function pct(part: number, total: number) {
  if (!total) return "—";
  return `${Math.round((part / total) * 100)}%`;
}

function whatsappLink(phone: string | null) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  return `https://wa.me/${digits.startsWith("55") ? digits : "55" + digits}`;
}

function originLabel(u: { utmSource: string | null; utmMedium: string | null }) {
  if (!u.utmSource) return "Sem rastreio";
  return u.utmMedium && u.utmMedium !== "none" ? `${u.utmSource} / ${u.utmMedium}` : u.utmSource;
}

type Status = "testando" | "assinou" | "expirou";

export default async function TesteGratisPage() {
  const EXCLUDED_EMAILS = await getExcludedEmails();
  const now = new Date();

  const users = await db.user.findMany({
    where: { email: { notIn: EXCLUDED_EMAILS }, trialStartedAt: { not: null }, anonymizedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      lastSeenAt: true,
      trialStartedAt: true,
      trialEndsAt: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      utmContent: true,
      subscription: { select: { createdAt: true, status: true } },
      emailDrips: { where: { step: { in: TRIAL_EMAILS.map((e) => e.step) } }, select: { step: true } },
    },
    orderBy: { trialStartedAt: "desc" },
  });

  const earliest = users.reduce<Date | null>(
    (min, u) => (u.trialStartedAt && (!min || u.trialStartedAt < min) ? u.trialStartedAt : min),
    null
  );
  const views = users.length
    ? await db.pageView.findMany({
        where: { userId: { in: users.map((u) => u.id) }, createdAt: { gte: earliest ?? now } },
        select: { userId: true, path: true, createdAt: true },
      })
    : [];

  // Uso de cada pessoa durante a janela do teste
  const usage = new Map<string, { views: number; days: Set<string>; bySection: Map<string, number> }>();
  const trialWindow = new Map(users.map((u) => [u.id, { start: u.trialStartedAt!, end: u.trialEndsAt! }]));
  const sectionTotals = new Map<string, { views: number; users: Set<string> }>();

  for (const v of views) {
    const w = trialWindow.get(v.userId);
    if (!w || v.createdAt < w.start || v.createdAt > w.end) continue;
    const entry = usage.get(v.userId) ?? { views: 0, days: new Set<string>(), bySection: new Map<string, number>() };
    entry.views++;
    entry.days.add(dayKey(v.createdAt));
    const sec = sectionOf(v.path);
    const label = sec?.label ?? "Outras páginas";
    entry.bySection.set(label, (entry.bySection.get(label) ?? 0) + 1);
    usage.set(v.userId, entry);

    const tot = sectionTotals.get(label) ?? { views: 0, users: new Set<string>() };
    tot.views++;
    tot.users.add(v.userId);
    sectionTotals.set(label, tot);
  }

  const rows = users.map((u) => {
    const start = u.trialStartedAt!;
    const end = u.trialEndsAt!;
    const status: Status = u.subscription ? "assinou" : end > now ? "testando" : "expirou";
    const dayOfTrial = Math.min(TRIAL_DAYS, Math.floor((now.getTime() - start.getTime()) / DAY) + 1);
    const msLeft = end.getTime() - now.getTime();
    const use = usage.get(u.id);
    const topSection = use
      ? [...use.bySection.entries()]
          .filter(([label]) => label !== "Outras páginas")
          .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"
      : "—";
    return {
      ...u,
      start,
      end,
      status,
      dayOfTrial,
      msLeft,
      views: use?.views ?? 0,
      activeDays: use?.days.size ?? 0,
      topSection,
      emailsSent: new Set(u.emailDrips.map((d) => d.step)),
    };
  });

  const total = rows.length;
  const testando = rows.filter((r) => r.status === "testando").length;
  const assinaram = rows.filter((r) => r.status === "assinou").length;
  const expiraram = rows.filter((r) => r.status === "expirou").length;
  const usaram = rows.filter((r) => r.activeDays >= ENGAGED_MIN_DAYS).length;
  const nuncaUsaram = rows.filter((r) => r.views === 0).length;
  // Conversão só faz sentido sobre quem já terminou o teste (ou assinou antes)
  const encerrados = assinaram + expiraram;

  const alertas = rows
    .filter((r) => r.status === "testando" && r.msLeft <= 2 * DAY)
    .sort((a, b) => a.msLeft - b.msLeft);

  // Origem: agrupa por fonte/meio/campanha/conteúdo
  const origins = new Map<string, { source: string; campaign: string; content: string; testes: number; assinaram: number }>();
  for (const r of rows) {
    const key = [originLabel(r), r.utmCampaign ?? "", r.utmContent ?? ""].join("|");
    const o = origins.get(key) ?? {
      source: originLabel(r),
      campaign: r.utmCampaign || "—",
      content: r.utmContent || "—",
      testes: 0,
      assinaram: 0,
    };
    o.testes++;
    if (r.status === "assinou") o.assinaram++;
    origins.set(key, o);
  }
  const originRows = [...origins.values()].sort((a, b) => b.testes - a.testes);

  const sectionRows = [...SECTIONS.map((s) => s.label), "Outras páginas"]
    .map((label) => {
      const t = sectionTotals.get(label);
      return {
        label,
        color: SECTIONS.find((s) => s.label === label)?.color ?? "bg-zinc-500",
        views: t?.views ?? 0,
        users: t?.users.size ?? 0,
      };
    })
    .filter((s) => s.views > 0 || s.label !== "Outras páginas");
  const maxSectionViews = Math.max(1, ...sectionRows.map((s) => s.views));

  const funnel = [
    { label: "Ativaram o teste", value: total, color: "bg-sky-500" },
    { label: `Usaram de verdade (${ENGAGED_MIN_DAYS}+ dias com acesso)`, value: usaram, color: "bg-violet-500" },
    { label: "Assinaram", value: assinaram, color: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Métricas</h1>
        <p className="text-sm text-zinc-400 mt-1">Teste grátis de {TRIAL_DAYS} dias: uso, origem e conversão</p>
      </div>
      <MetricasTabs />

      {/* Resumo */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">Resumo</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Tile label="Ativaram" value={total} sub="desde o início" />
          <Tile label="Em teste agora" value={testando} />
          <Tile label="Usaram de verdade" value={usaram} sub={`${pct(usaram, total)} · ${nuncaUsaram} nunca abriram`} />
          <Tile label="Assinaram" value={assinaram} sub={`${pct(assinaram, encerrados)} dos que já encerraram`} color="green" />
          <Tile label="Expiraram sem assinar" value={expiraram} color={expiraram ? "red" : undefined} />
        </div>
      </section>

      {/* Alertas */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">
          Terminam em até 2 dias sem assinatura ({alertas.length})
        </h2>
        {alertas.length === 0 ? (
          <p className="text-sm text-zinc-400 bg-[#161b22] rounded-xl border border-white/10 p-4">
            Ninguém com o teste terminando nos próximos 2 dias.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {alertas.map((r) => {
              const wa = whatsappLink(r.phone);
              const horas = Math.max(0, Math.round(r.msLeft / 3_600_000));
              return (
                <div key={r.id} className="bg-[#161b22] rounded-xl border border-white/10 border-l-4 border-l-amber-400 p-4">
                  <p className="font-semibold text-zinc-100 truncate">{r.name || "Sem nome"}</p>
                  <p className="text-xs text-zinc-400 truncate">{r.email}</p>
                  <p className="text-xs text-amber-300 mt-2">
                    Termina em {horas < 24 ? `${horas}h` : `${Math.round(horas / 24)} dia(s)`} ({fmtDateTime(r.end)})
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {r.activeDays} dia(s) com acesso · {r.views} páginas · mais usou: {r.topSection}
                  </p>
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-xs font-medium px-3 py-1.5 rounded-md bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                    >
                      Abrir WhatsApp
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Funil */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">Funil</h2>
          <div className="bg-[#161b22] rounded-xl border border-white/10 p-5 space-y-3">
            {funnel.map((f) => (
              <div key={f.label}>
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-xs text-zinc-300 font-medium">{f.label}</span>
                  <span className="text-xs text-zinc-400 font-bold whitespace-nowrap">
                    {f.value} · {pct(f.value, total)}
                  </span>
                </div>
                <div className="h-6 bg-white/5 rounded-md overflow-hidden">
                  <div className={`h-full ${f.color} rounded-md`} style={{ width: `${total ? Math.max(4, (f.value / total) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Uso por seção */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">O que mais usam no teste</h2>
          <div className="bg-[#161b22] rounded-xl border border-white/10 p-5 space-y-3">
            {sectionRows.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-xs text-zinc-300 font-medium">{s.label}</span>
                  <span className="text-xs text-zinc-400 font-bold whitespace-nowrap">
                    {s.views} acessos · {s.users} pessoa(s)
                  </span>
                </div>
                <div className="h-6 bg-white/5 rounded-md overflow-hidden">
                  <div className={`h-full ${s.color} rounded-md`} style={{ width: `${s.views ? Math.max(4, (s.views / maxSectionViews) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Origem */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">De onde vieram</h2>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-[#161b22] text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Origem</th>
                  <th className="text-left px-4 py-3">Campanha</th>
                  <th className="text-left px-4 py-3">Anúncio / conteúdo</th>
                  <th className="text-right px-4 py-3">Testes</th>
                  <th className="text-right px-4 py-3">Assinaram</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {originRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">Nenhum teste ainda.</td>
                  </tr>
                )}
                {originRows.map((o) => (
                  <tr key={`${o.source}|${o.campaign}|${o.content}`} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-zinc-200">{o.source}</td>
                    <td className="px-4 py-3 text-zinc-400">{o.campaign}</td>
                    <td className="px-4 py-3 text-zinc-400">{o.content}</td>
                    <td className="px-4 py-3 text-right text-zinc-200 font-semibold">{o.testes}</td>
                    <td className="px-4 py-3 text-right text-zinc-200">
                      {o.assinaram} <span className="text-zinc-500 text-xs">({pct(o.assinaram, o.testes)})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-[11px] text-zinc-500 mt-2">
          A origem é a do primeiro acesso ao site (cookie de 90 dias). &quot;Anúncio / conteúdo&quot; vem do utm_content e só existe para quem se cadastrou a partir de 15/10/2026.
        </p>
      </section>

      {/* Lista */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">Quem testou ({total})</h2>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="bg-[#161b22] text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Pessoa</th>
                  <th className="text-left px-4 py-3">Situação</th>
                  <th className="text-left px-4 py-3">Período</th>
                  <th className="text-right px-4 py-3">Dias c/ acesso</th>
                  <th className="text-right px-4 py-3">Páginas</th>
                  <th className="text-left px-4 py-3">Mais usou</th>
                  <th className="text-left px-4 py-3">Última visita</th>
                  <th className="text-left px-4 py-3">Origem</th>
                  <th className="text-left px-4 py-3">Emails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-zinc-400">Nenhum teste ainda.</td>
                  </tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] align-top">
                    <td className="px-4 py-3">
                      <p className="text-zinc-200 font-medium">{r.name || "Sem nome"}</p>
                      <p className="text-xs text-zinc-500">{r.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} dayOfTrial={r.dayOfTrial} />
                    </td>
                    <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                      {fmtDate(r.start)} → {fmtDate(r.end)}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-200">{r.activeDays}</td>
                    <td className="px-4 py-3 text-right text-zinc-200">{r.views}</td>
                    <td className="px-4 py-3 text-zinc-400">{r.topSection}</td>
                    <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">{fmtDateTime(r.lastSeenAt)}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      <p>{originLabel(r)}</p>
                      {(r.utmCampaign || r.utmContent) && (
                        <p className="text-[11px] text-zinc-500">
                          {[r.utmCampaign, r.utmContent].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {TRIAL_EMAILS.map((e) => (
                          <span
                            key={e.step}
                            title={r.emailsSent.has(e.step) ? "Enviado" : "Não enviado"}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              r.emailsSent.has(e.step) ? "bg-sky-500/20 text-sky-300" : "bg-white/5 text-zinc-600"
                            }`}
                          >
                            {e.label}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-[11px] text-zinc-500 mt-2">
          Dias com acesso e páginas contam só o período do teste. Emails: D1 (início), D5 (faltam 2 dias), Fim e +3d (3 dias depois do fim) — não saem para quem já assinou.
        </p>
      </section>
    </div>
  );
}

function StatusBadge({ status, dayOfTrial }: { status: Status; dayOfTrial: number }) {
  if (status === "assinou") {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 whitespace-nowrap">Assinou</span>;
  }
  if (status === "expirou") {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 whitespace-nowrap">Expirou</span>;
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 whitespace-nowrap">
      Dia {dayOfTrial} de {TRIAL_DAYS}
    </span>
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
  color?: "green" | "red";
}) {
  const accent =
    color === "green" ? "border-l-4 border-l-emerald-400" : color === "red" ? "border-l-4 border-l-red-400" : "";
  return (
    <div className={`bg-[#161b22] rounded-xl border border-white/10 p-4 ${accent}`}>
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
      {sub && <p className="text-[11px] text-zinc-400 mt-0.5">{sub}</p>}
    </div>
  );
}
