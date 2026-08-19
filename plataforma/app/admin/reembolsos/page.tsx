export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Reembolsos · Admin" };

export default async function AdminReembolsosPage() {
  const [orders, aggregate] = await Promise.all([
    db.order.findMany({
      where: { status: "REFUNDED" },
      orderBy: { createdAt: "desc" },
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

  const fmt = (d: Date | null | undefined) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Reembolsos</h1>
        <p className="text-sm text-zinc-500 mt-1">Pedidos reembolsados e acesso removido</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3 max-w-sm">
        <div className="bg-white rounded-xl border border-zinc-200 border-l-4 border-l-blue-400 p-4">
          <p className="text-xs text-zinc-500 mb-1">Total reembolsado</p>
          <p className="text-2xl font-bold text-zinc-900">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
              (aggregate._sum.totalCents ?? 0) / 100
            )}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500 mb-1">Quantidade</p>
          <p className="text-2xl font-bold text-zinc-900">{aggregate._count}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">reembolso{aggregate._count !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[650px]">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Cliente</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Produto</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Valor</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Gateway</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Pago em</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Pedido criado em</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-zinc-100 last:border-none hover:bg-zinc-50">
                <td className="px-5 py-4">
                  <div className="font-medium text-zinc-900">{o.user.name ?? "—"}</div>
                  <div className="text-xs text-zinc-400">{o.user.email}</div>
                </td>
                <td className="px-5 py-4 text-zinc-600 text-xs">
                  {o.items.map((i) => i.product.title).join(", ")}
                </td>
                <td className="px-5 py-4 font-medium text-zinc-900">
                  {formatPrice(o.totalCents, o.currency)}
                </td>
                <td className="px-5 py-4 text-zinc-500 text-xs">
                  {o.provider === "MERCADOPAGO" ? "Mercado Pago" : "Stripe"}
                </td>
                <td className="px-5 py-4 text-zinc-400 text-xs">{fmt(o.paidAt)}</td>
                <td className="px-5 py-4 text-zinc-400 text-xs">{fmt(o.createdAt)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-zinc-400">
                  Nenhum reembolso até o momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
