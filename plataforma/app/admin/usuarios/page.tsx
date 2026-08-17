export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Usuários · Admin · Rotina Clínica" };

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  ACTIVE:    { label: "Ativo",     cls: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Cancelado", cls: "bg-red-100 text-red-700" },
  EXPIRED:   { label: "Expirado",  cls: "bg-zinc-100 text-zinc-600" },
  PAST_DUE:  { label: "Em atraso", cls: "bg-amber-100 text-amber-700" },
};

const PLAN_LABEL: Record<string, string> = {
  MONTHLY: "Mensal",
  ANNUAL:  "Anual",
};

export default async function AdminUsuariosPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, createdAt: true, cpf: true, phone: true,
      subscription: { select: { plan: true, status: true, currentPeriodStart: true, currentPeriodEnd: true } },
      orders: {
        where: { status: "PAID" },
        orderBy: { paidAt: "asc" },
        take: 1,
        select: { paidAt: true, totalCents: true, provider: true },
      },
    },
  });

  const fmt = (d: Date | null | undefined) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "—";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Usuários</h1>
          <p className="text-sm text-zinc-500 mt-1">{users.length} cadastros no total</p>
        </div>
        <Link href="/admin" className="text-sm text-violet-600 hover:underline">← Admin</Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Usuário</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">CPF</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Celular</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Cadastro</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Plano</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">1ª Compra</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Vence em</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const sub = u.subscription;
              const firstOrder = u.orders[0];
              const status = sub ? STATUS_LABEL[sub.status] : null;

              return (
                <tr key={u.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-800">{u.name || "—"}</p>
                    <p className="text-xs text-zinc-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {u.cpf ? (
                      <span className="text-zinc-600 font-mono">{u.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")}</span>
                    ) : (
                      <span className="text-red-400 font-medium">sem CPF</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {u.phone ? (
                      <span className="text-zinc-600">{u.phone}</span>
                    ) : (
                      <span className="text-amber-400 font-medium">sem phone</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{fmt(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    {sub ? (
                      <span className="text-zinc-700">{PLAN_LABEL[sub.plan] ?? sub.plan}</span>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {status ? (
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${status.cls}`}>
                        {status.label}
                      </span>
                    ) : (
                      <span className="text-zinc-300 text-xs">Sem assinatura</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {firstOrder ? (
                      <span title={firstOrder.provider}>{fmt(firstOrder.paidAt)}</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {sub ? fmt(sub.currentPeriodEnd) : "—"}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">Nenhum usuário</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
