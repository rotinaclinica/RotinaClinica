export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import SearchBox from "../_components/SearchBox";
import Pagination from "../_components/Pagination";
import ExportButton from "../_components/ExportButton";

export const metadata = { title: "Reembolsos · Admin" };

const PAGE_SIZE = 30;

export default async function AdminReembolsosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const query = q?.trim() ?? "";
  const page = Math.max(1, Number(pageParam) || 1);

  const searchWhere = query
    ? {
        status: "REFUNDED" as const,
        OR: [
          { user: { name: { contains: query, mode: "insensitive" as const } } },
          { user: { email: { contains: query, mode: "insensitive" as const } } },
        ],
      }
    : { status: "REFUNDED" as const };

  const [total, orders, aggregate] = await Promise.all([
    db.order.count({ where: searchWhere }),
    db.order.findMany({
      where: searchWhere,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: {
        user: { select: { email: true, name: true } },
        items: { include: { product: { select: { title: true } } } },
      },
    }),
    db.order.aggregate({
      where: { status: "REFUNDED" },
      _sum: { totalCents: true },
      _count: true,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fmt = (d: Date | null | undefined) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Reembolsos</h1>
          <p className="text-sm text-zinc-400 mt-1">Pedidos reembolsados e acesso removido</p>
        </div>
        <ExportButton type="pedidos" />
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3 max-w-sm">
        <div className="bg-[#161b22] rounded-xl border border-white/10 border-l-4 border-l-blue-400 p-4">
          <p className="text-xs text-zinc-400 mb-1">Total reembolsado</p>
          <p className="text-2xl font-bold text-zinc-100">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
              (aggregate._sum.totalCents ?? 0) / 100
            )}
          </p>
        </div>
        <div className="bg-[#161b22] rounded-xl border border-white/10 p-4">
          <p className="text-xs text-zinc-400 mb-1">Quantidade</p>
          <p className="text-2xl font-bold text-zinc-100">{aggregate._count}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">reembolso{aggregate._count !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <SearchBox placeholder="Buscar por nome ou e-mail…" />

      {/* Tabela */}
      <div className="bg-[#161b22] rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[650px]">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-zinc-400">Cliente</th>
                <th className="text-left px-5 py-3 font-medium text-zinc-400">Produto</th>
                <th className="text-left px-5 py-3 font-medium text-zinc-400">Valor</th>
                <th className="text-left px-5 py-3 font-medium text-zinc-400">Gateway</th>
                <th className="text-left px-5 py-3 font-medium text-zinc-400">Pago em</th>
                <th className="text-left px-5 py-3 font-medium text-zinc-400">Pedido criado em</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-white/10 last:border-none hover:bg-white/5">
                  <td className="px-5 py-4">
                    <div className="font-medium text-zinc-100">{o.user.name ?? "—"}</div>
                    <div className="text-xs text-zinc-400">{o.user.email}</div>
                  </td>
                  <td className="px-5 py-4 text-zinc-400 text-xs">
                    {o.items.map((i) => i.product.title).join(", ")}
                  </td>
                  <td className="px-5 py-4 font-medium text-zinc-100">
                    {formatPrice(o.totalCents, o.currency)}
                  </td>
                  <td className="px-5 py-4 text-zinc-400 text-xs">
                    {o.provider === "MERCADOPAGO" ? "Mercado Pago" : o.provider === "ASAAS" ? "Asaas" : "Stripe"}
                  </td>
                  <td className="px-5 py-4 text-zinc-400 text-xs">{fmt(o.paidAt)}</td>
                  <td className="px-5 py-4 text-zinc-400 text-xs">{fmt(o.createdAt)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-400">
                    {query ? `Nenhum reembolso para "${query}"` : "Nenhum reembolso até o momento."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/admin/reembolsos" params={{ q: query || undefined }} />
    </div>
  );
}
