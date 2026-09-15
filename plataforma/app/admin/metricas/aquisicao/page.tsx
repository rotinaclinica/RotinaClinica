export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { getExcludedEmails } from "../../_lib/excluded-emails";
import MetricasTabs from "../_components/MetricasTabs";

export const metadata = { title: "Aquisição · Métricas · Admin" };

const CHANNEL_CONFIG: Record<string, { label: string; color: string }> = {
  google: { label: "Google", color: "bg-blue-500" },
  instagram: { label: "Instagram", color: "bg-pink-500" },
  facebook: { label: "Facebook", color: "bg-blue-600" },
  youtube: { label: "YouTube", color: "bg-red-500" },
  tiktok: { label: "TikTok", color: "bg-zinc-100" },
  twitter: { label: "Twitter/X", color: "bg-sky-500" },
  direto: { label: "Acesso direto", color: "bg-emerald-500" },
  embaixador: { label: "Embaixador", color: "bg-violet-500" },
};

function getChannelInfo(source: string | null) {
  const key = (source ?? "").toLowerCase();
  return CHANNEL_CONFIG[key] ?? { label: source || "Desconhecido", color: "bg-zinc-600" };
}

export default async function AquisicaoPage() {
  const EXCLUDED_EMAILS = await getExcludedEmails();

  const subscribers = await db.user.findMany({
    where: {
      email: { notIn: EXCLUDED_EMAILS },
      subscription: { isNot: null },
      utmSource: { notIn: ["pre-tracking"] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      referrerUrl: true,
      createdAt: true,
      subscription: { select: { plan: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const channelCounts = new Map<string, { total: number; active: number }>();
  for (const sub of subscribers) {
    const src = (sub.utmSource ?? "pre-tracking").toLowerCase();
    const entry = channelCounts.get(src) ?? { total: 0, active: 0 };
    entry.total++;
    if (sub.subscription?.status === "ACTIVE") entry.active++;
    channelCounts.set(src, entry);
  }

  const channels = [...channelCounts.entries()]
    .map(([source, counts]) => ({ source, ...counts, info: getChannelInfo(source) }))
    .sort((a, b) => b.total - a.total);

  const totalSubs = subscribers.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Métricas</h1>
        <p className="text-sm text-zinc-400 mt-1">Rastreamento de canais de aquisição</p>
      </div>
      <MetricasTabs />

      {/* Channel summary cards */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">
          Canais de aquisição
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {channels.map((ch) => (
            <div
              key={ch.source}
              className="bg-[#161b22] rounded-xl border border-white/10 p-4 border-l-4"
              style={{ borderLeftColor: "var(--accent)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2.5 h-2.5 rounded-full ${ch.info.color}`} />
                <p className="text-xs text-zinc-400">{ch.info.label}</p>
              </div>
              <p className="text-2xl font-bold text-zinc-100">{ch.total}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {ch.active} ativo{ch.active !== 1 ? "s" : ""} · {totalSubs ? ((ch.total / totalSubs) * 100).toFixed(0) : 0}% do total
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bar chart */}
      {channels.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">
            Distribuição por canal
          </h2>
          <div className="bg-[#161b22] rounded-xl border border-white/10 p-5">
            <div className="space-y-3">
              {channels.map((ch) => {
                const width = Math.max(8, (ch.total / channels[0].total) * 100);
                return (
                  <div key={ch.source}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-300 font-medium">{ch.info.label}</span>
                      <span className="text-xs text-zinc-400 font-bold">{ch.total}</span>
                    </div>
                    <div className="h-6 bg-white/5 rounded-md overflow-hidden">
                      <div
                        className={`h-full ${ch.info.color} rounded-md`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Subscriber table */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-100 mb-3">
          Assinantes por canal ({subscribers.length})
        </h2>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[750px]">
              <thead>
                <tr className="bg-[#161b22] text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Nome</th>
                  <th className="text-left px-4 py-3">Canal</th>
                  <th className="text-left px-4 py-3">Meio</th>
                  <th className="text-left px-4 py-3">Campanha</th>
                  <th className="text-left px-4 py-3">Plano</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {subscribers.map((sub) => {
                  const ch = getChannelInfo(sub.utmSource);
                  return (
                    <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-zinc-200 font-medium">{sub.name || "—"}</p>
                        <p className="text-zinc-500 text-xs">{sub.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${ch.color}`} />
                          <span className="text-zinc-300">{ch.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{sub.utmMedium || "—"}</td>
                      <td className="px-4 py-3 text-zinc-400">{sub.utmCampaign || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          sub.subscription?.plan === "ANNUAL"
                            ? "bg-indigo-500/20 text-indigo-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {sub.subscription?.plan === "ANNUAL" ? "Anual" : "Mensal"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          sub.subscription?.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-red-500/20 text-red-300"
                        }`}>
                          {sub.subscription?.status === "ACTIVE" ? "Ativo" : sub.subscription?.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap">
                        {new Date(sub.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  );
                })}
                {subscribers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <p className="text-zinc-400 font-medium">Nenhum dado de aquisição ainda</p>
                      <p className="text-zinc-500 text-xs mt-1">Os próximos assinantes terão o canal de origem registrado automaticamente</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
