export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { GrantAccessForm } from "./grant-access-form";
import { RevokeButton } from "./revoke-button";
import SearchBox from "../_components/SearchBox";
import Pagination from "../_components/Pagination";

export const metadata = { title: "Acessos · Admin" };

const PAGE_SIZE = 30;

const planLabel = (plan: string) =>
  plan === "ANNUAL" ? "Anual" : "Mensal";

const statusStyle = (status: string) => {
  if (status === "ACTIVE")    return "bg-green-500/20 text-green-300";
  if (status === "CANCELLED") return "bg-red-500/20 text-red-400";
  if (status === "EXPIRED")   return "bg-white/10 text-zinc-400";
  return "bg-amber-500/20 text-amber-300";
};

export default async function AdminAcessosPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; q?: string; page?: string }>;
}) {
  const { email, q, page: pageParam } = await searchParams;
  const query = q?.trim() ?? "";
  const page = Math.max(1, Number(pageParam) || 1);

  const searchWhere = query
    ? {
        OR: [
          { user: { name: { contains: query, mode: "insensitive" as const } } },
          { user: { email: { contains: query, mode: "insensitive" as const } } },
        ],
      }
    : undefined;

  const [total, subscriptions] = await Promise.all([
    db.subscription.count({ where: searchWhere }),
    db.subscription.findMany({
      where: searchWhere,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: { user: { select: { email: true, name: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Acessos</h1>
        <p className="text-sm text-zinc-400 mt-1">Gerencie assinaturas manualmente</p>
      </div>

      {/* Formulário de liberar acesso */}
      <div className="bg-[#161b22] rounded-2xl border border-white/10 p-6">
        <h2 className="text-base font-semibold mb-5">Liberar acesso</h2>
        <GrantAccessForm defaultEmail={email ?? ""} />
      </div>

      {/* Busca */}
      <SearchBox placeholder="Buscar por nome ou e-mail…" />

      {/* Tabela de assinaturas */}
      <div className="bg-[#161b22] rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-400">Assinaturas</p>
          <span className="text-xs text-zinc-400">{total} total</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-zinc-400">Usuário</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-400">Plano</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-400">Status</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-400">Vence em</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((s) => (
              <tr key={s.id} className="border-b border-white/10 last:border-none">
                <td className="px-5 py-4">
                  <div className="font-medium text-zinc-100">{s.user.name ?? "—"}</div>
                  <div className="text-xs text-zinc-400">{s.user.email}</div>
                </td>
                <td className="px-5 py-4 text-zinc-400">{planLabel(s.plan)}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyle(s.status)}`}>
                    {s.status === "ACTIVE" ? "Ativa" : s.status === "CANCELLED" ? "Cancelada" : s.status === "EXPIRED" ? "Expirada" : "Em atraso"}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-zinc-400">
                  {s.currentPeriodEnd
                    ? new Date(s.currentPeriodEnd).toLocaleDateString("pt-BR")
                    : "—"}
                </td>
                <td className="px-5 py-4">
                  {s.status === "ACTIVE" && <RevokeButton subscriptionId={s.id} />}
                </td>
              </tr>
            ))}
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-zinc-400">
                  {query ? `Nenhuma assinatura para "${query}"` : "Nenhuma assinatura ainda."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/admin/acessos" params={{ q: query || undefined }} />
    </div>
  );
}
