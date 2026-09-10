export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { GrantAccessForm } from "./grant-access-form";
import { RevokeButton } from "./revoke-button";

export const metadata = { title: "Acessos · Admin" };

const planLabel = (plan: string) =>
  plan === "ANNUAL" ? "Anual" : "Mensal";

const statusStyle = (status: string) => {
  if (status === "ACTIVE")    return "bg-green-100 text-green-700";
  if (status === "CANCELLED") return "bg-red-100 text-red-600";
  if (status === "EXPIRED")   return "bg-white/10 text-zinc-400";
  return "bg-amber-100 text-amber-700";
};

export default async function AdminAcessosPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const subscriptions = await db.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true, name: true } } },
  });

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Acessos</h1>
        <p className="text-sm text-zinc-400 mt-1">Gerencie assinaturas manualmente</p>
      </div>

      {/* Formulário de liberar acesso */}
      <div className="bg-[#161b22] rounded-2xl border border-white/10 p-6">
        <h2 className="text-base font-semibold mb-5">Liberar acesso</h2>
        <GrantAccessForm defaultEmail={email ?? ""} />
      </div>

      {/* Tabela de assinaturas */}
      <div className="bg-[#161b22] rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-400">Assinaturas</p>
          <span className="text-xs text-zinc-400">{subscriptions.length} total</span>
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
                  Nenhuma assinatura ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
