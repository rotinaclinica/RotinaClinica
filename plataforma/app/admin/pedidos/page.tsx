export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Pedidos" };

const statusLabel: Record<string, { text: string; color: string }> = {
  PENDING: { text: "Pendente", color: "bg-yellow-100 text-yellow-700" },
  PAID: { text: "Pago", color: "bg-green-100 text-green-700" },
  FAILED: { text: "Falhou", color: "bg-red-100 text-red-700" },
  EXPIRED: { text: "Expirado", color: "bg-zinc-100 text-zinc-500" },
  REFUNDED: { text: "Reembolsado", color: "bg-blue-100 text-blue-700" },
};

export default async function AdminPedidosPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { email: true, name: true } },
      items: { include: { product: { select: { title: true } } } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Pedidos</h1>
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Cliente</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Produto(s)</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Valor</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Gateway</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Status</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Data</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const st = statusLabel[order.status] ?? { text: order.status, color: "" };
              return (
                <tr key={order.id} className="border-b border-zinc-100 last:border-none">
                  <td className="px-5 py-4">
                    <div className="font-medium">{order.user.name}</div>
                    <div className="text-xs text-zinc-400">{order.user.email}</div>
                  </td>
                  <td className="px-5 py-4 text-zinc-600">
                    {order.items.map((i) => i.product.title).join(", ")}
                  </td>
                  <td className="px-5 py-4 font-medium">
                    {formatPrice(order.totalCents, order.currency)}
                  </td>
                  <td className="px-5 py-4 text-zinc-500 capitalize">
                    {order.provider === "MERCADOPAGO" ? "Mercado Pago" : "Stripe"}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                      {st.text}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-zinc-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="text-center text-zinc-500 py-10">Nenhum pedido ainda.</p>
        )}
      </div>
    </div>
  );
}
