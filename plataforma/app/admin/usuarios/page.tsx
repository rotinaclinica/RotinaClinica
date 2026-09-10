export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import Link from "next/link";
import SearchBox from "../_components/SearchBox";
import Pagination from "../_components/Pagination";
import ExportButton from "../_components/ExportButton";

export const metadata = { title: "Usuários · Admin · Rotina Clínica" };

const PAGE_SIZE = 50;

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  ACTIVE:    { label: "Ativo",     cls: "bg-emerald-500/20 text-emerald-300" },
  CANCELLED: { label: "Cancelado", cls: "bg-red-500/20 text-red-300" },
  EXPIRED:   { label: "Expirado",  cls: "bg-white/10 text-zinc-400" },
  PAST_DUE:  { label: "Em atraso", cls: "bg-amber-500/20 text-amber-300" },
};

const PLAN_LABEL: Record<string, string> = {
  MONTHLY: "Mensal",
  ANNUAL:  "Anual",
};

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const query = q?.trim() ?? "";
  const page = Math.max(1, Number(pageParam) || 1);

  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { email: { contains: query, mode: "insensitive" as const } },
          { cpf: { contains: query.replace(/\D/g, "") } },
        ],
      }
    : undefined;

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      select: {
        id: true, name: true, email: true, createdAt: true, cpf: true, phone: true, lastSeenAt: true,
        subscription: { select: { plan: true, status: true, currentPeriodStart: true, currentPeriodEnd: true } },
        orders: {
          where: { status: "PAID" },
          select: { paidAt: true, totalCents: true, provider: true },
          orderBy: { paidAt: "asc" },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fmt = (d: Date | null | undefined) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "—";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Usuários</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {total} cadastro{total !== 1 ? "s" : ""}{query ? ` para "${query}"` : " no total"}
          </p>
        </div>
        <Link href="/admin" className="text-sm text-violet-400 hover:underline">← Admin</Link>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <SearchBox />
        <ExportButton type="usuarios" />
      </div>

      <div className="bg-[#161b22] rounded-xl border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Usuário</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">CPF</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Celular</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Cadastro</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Último acesso</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Plano</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">1ª Compra</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Gasto total</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Vence em</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const sub = u.subscription;
              const firstOrder = u.orders[0];
              const gastoTotal = u.orders.reduce((sum, o) => sum + o.totalCents, 0);
              const status = sub ? STATUS_LABEL[sub.status] : null;

              return (
                <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-100">{u.name || "—"}</p>
                    <p className="text-xs text-zinc-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {u.cpf ? (
                      <span className="text-zinc-400 font-mono">{u.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")}</span>
                    ) : (
                      <span className="text-red-400 font-medium">sem CPF</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {u.phone ? (
                      <span className="text-zinc-400">{u.phone}</span>
                    ) : (
                      <span className="text-amber-400 font-medium">sem phone</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{fmt(u.createdAt)}</td>
                  <td className="px-4 py-3 text-xs">
                    {u.lastSeenAt ? (
                      <span className="text-zinc-400">{fmt(u.lastSeenAt)}</span>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {sub ? (
                      <span className="text-zinc-400">{PLAN_LABEL[sub.plan] ?? sub.plan}</span>
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
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {firstOrder ? (
                      <span title={firstOrder.provider}>{fmt(firstOrder.paidAt)}</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-zinc-400">
                    {gastoTotal > 0 ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(gastoTotal / 100) : <span className="text-zinc-300 font-normal">—</span>}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {sub ? fmt(sub.currentPeriodEnd) : "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/admin/usuarios/${u.id}`}
                      className="text-xs font-semibold text-violet-400 hover:underline"
                    >
                      Gerenciar
                    </Link>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-zinc-400">
                  {query ? `Nenhum usuário para "${query}"` : "Nenhum usuário"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/admin/usuarios" params={{ q: query || undefined }} />
    </div>
  );
}
