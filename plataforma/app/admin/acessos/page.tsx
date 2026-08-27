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
  if (status === "EXPIRED")   return "bg-zinc-100 text-zinc-500";
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
        <h1 className="text-2xl font-bold text-zinc-900">Acessos</h1>
        <p className="text-sm text-zinc-500 mt-1">Gerencie assinaturas manualmente</p>
      </div>

      {/* Formulário de liberar acesso */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <h2 className="text-base font-semibold mb-5">Liberar acesso</h2>
        <GrantAccessForm defaultEmail={email ?? ""} />
      </div>

      {/* Tabela de assinaturas */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-700">Assinaturas</p>
          <span className="text-xs text-zinc-400">{subscriptions.length} total</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Usuário</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Plano</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Status</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Vence em</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((s) => (
              <tr key={s.id} className="border-b border-zinc-100 last:border-none">
                <td className="px-5 py-4">
                  <div className="font-medium text-zinc-900">{s.user.name ?? "—"}</div>
                  <div className="text-xs text-zinc-400">{s.user.email}</div>
                </td>
                <td className="px-5 py-4 text-zinc-600">{planLabel(s.plan)}</td>
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
