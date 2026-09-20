export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminRequest } from "@/lib/require-admin";

export const metadata = { title: "Auditoria · Admin · Rotina Clínica" };

const TYPE_LABEL: Record<string, string> = {
  usuarios: "Usuários",
  leads: "Leads",
  pedidos: "Pedidos",
  notas: "Notas fiscais",
};

const fmt = (d: Date) =>
  new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export default async function AuditoriaPage() {
  if (!(await isAdminRequest())) redirect("/dashboard");

  const [exports, anons] = await Promise.all([
    db.adminExportLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.anonymizationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  // Resolve nomes dos admins referenciados
  const adminIds = Array.from(
    new Set([
      ...exports.map((e) => e.adminId),
      ...anons.map((a) => (a.triggeredBy !== "self" ? a.triggeredBy : null)).filter(Boolean) as string[],
      ...anons.map((a) => a.userId),
    ])
  );
  const users = await db.user.findMany({
    where: { id: { in: adminIds } },
    select: { id: true, name: true, email: true, anonymizedAt: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const userLabel = (id: string) => {
    const u = userMap.get(id);
    if (!u) return id.slice(0, 8);
    if (u.anonymizedAt) return `${u.name ?? "?"} (anonimizado)`;
    return u.name ?? u.email;
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Auditoria (LGPD Art. 37)</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Registro imutável de operações sensíveis. Últimos 100 eventos de cada tipo.
          </p>
        </div>
        <Link href="/admin" className="text-sm text-violet-400 hover:underline">← Admin</Link>
      </div>

      {/* Exports */}
      <section>
        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wide mb-3">
          Exportações de CSV ({exports.length})
        </h2>
        <div className="bg-[#161b22] rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Quando</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Admin</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Tipo</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-400">Registros</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">IP</th>
                </tr>
              </thead>
              <tbody>
                {exports.map((e) => (
                  <tr key={e.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                    <td className="px-4 py-3 text-zinc-400 text-xs">{fmt(e.createdAt)}</td>
                    <td className="px-4 py-3 text-zinc-200 text-xs">{userLabel(e.adminId)}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="inline-block px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[10px] font-bold uppercase">
                        {TYPE_LABEL[e.type] ?? e.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300 text-xs font-mono">{e.rowCount}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs font-mono">{e.ip ?? "—"}</td>
                  </tr>
                ))}
                {exports.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">Nenhum export registrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Anonimizações */}
      <section>
        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wide mb-3">
          Anonimizações de conta ({anons.length})
        </h2>
        <div className="bg-[#161b22] rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Quando</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Usuário anonimizado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Disparado por</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Assinatura ativa?</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {anons.map((a) => (
                  <tr key={a.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                    <td className="px-4 py-3 text-zinc-400 text-xs">{fmt(a.createdAt)}</td>
                    <td className="px-4 py-3 text-zinc-200 text-xs">{userLabel(a.userId)}</td>
                    <td className="px-4 py-3 text-zinc-300 text-xs">
                      {a.triggeredBy === "self" ? (
                        <span className="text-emerald-400 font-medium">Próprio usuário</span>
                      ) : (
                        <span>Admin: {userLabel(a.triggeredBy)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {a.hadSubscription ? (
                        <span className="text-amber-300">Sim{a.gatewayResult ? ` · ${a.gatewayResult}` : ""}</span>
                      ) : (
                        <span className="text-zinc-500">Não</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs max-w-[300px] truncate" title={a.reason ?? ""}>
                      {a.reason ?? "—"}
                    </td>
                  </tr>
                ))}
                {anons.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">Nenhuma anonimização registrada.</td>
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
