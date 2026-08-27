export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import SearchBox from "../_components/SearchBox";
import Pagination from "../_components/Pagination";
import ExportButton from "../_components/ExportButton";

export const metadata = { title: "Pedidos · Admin" };

const PAGE_SIZE = 50;

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "PAID", label: "Pagos" },
  { value: "PENDING", label: "Pendentes" },
  { value: "REFUNDED", label: "Reembolsados" },
  { value: "EXPIRED", label: "Expirados" },
  { value: "FAILED", label: "Falhou" },
];

const statusLabel: Record<string, { text: string; color: string }> = {
  PENDING:  { text: "Pendente",     color: "bg-yellow-100 text-yellow-700" },
  PAID:     { text: "Pago",         color: "bg-green-100 text-green-700" },
  FAILED:   { text: "Falhou",       color: "bg-red-100 text-red-700" },
  EXPIRED:  { text: "Expirado",     color: "bg-zinc-100 text-zinc-500" },
  REFUNDED: { text: "Reembolsado",  color: "bg-blue-100 text-blue-700" },
};

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { status, q, page: pageParam } = await searchParams;
  const query = q?.trim() ?? "";
  const page = Math.max(1, Number(pageParam) || 1);
  const statusFilter = STATUS_OPTIONS.map((o) => o.value).includes(status ?? "")
    ? status
    : undefined;

  const where = {
    ...(statusFilter ? { status: statusFilter as "PAID" | "PENDING" | "FAILED" | "EXPIRED" | "REFUNDED" } : {}),
    ...(query
      ? {
          user: {
            OR: [
              { email: { contains: query, mode: "insensitive" as const } },
              { name: { contains: query, mode: "insensitive" as const } },
            ],
          },
        }
      : {}),
  };
  const hasWhere = Object.keys(where).length > 0;

  const [total, orders] = await Promise.all([
    db.order.count({ where: hasWhere ? where : undefined }),
    db.order.findMany({
      where: hasWhere ? where : undefined,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: {
        user: { select: { email: true, name: true } },
        items: { include: { product: { select: { title: true } } } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-zinc-900">Pedidos</h1>
        <ExportButton type="pedidos" />
      </div>

      <SearchBox placeholder="Buscar por cliente ou e-mail…" />

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = (status ?? "") === opt.value;
          const sp = new URLSearchParams();
          if (opt.value) sp.set("status", opt.value);
          if (query) sp.set("q", query);
          const qs = sp.toString();
          return (
            <Link
              key={opt.value}
              href={qs ? `/admin/pedidos?${qs}` : "/admin/pedidos"}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-violet-600 text-white"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:border-violet-400"
              }`}
            >
              {opt.label}
            </Link>
          );
        })}
        <span className="ml-auto text-xs text-zinc-400 self-center">{total} resultado{total !== 1 ? "s" : ""}</span>
      </div>

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
                <tr key={order.id} className="border-b border-zinc-100 last:border-none hover:bg-zinc-50">
                  <td className="px-5 py-4">
                    <div className="font-medium text-zinc-900">{order.user.name}</div>
                    <div className="text-xs text-zinc-400">{order.user.email}</div>
                  </td>
                  <td className="px-5 py-4 text-zinc-600 text-xs">
                    {order.items.map((i) => i.product.title).join(", ")}
                  </td>
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    {formatPrice(order.totalCents, order.currency)}
                  </td>
                  <td className="px-5 py-4 text-zinc-500 text-xs">
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
          <p className="text-center text-zinc-500 py-10">Nenhum pedido encontrado.</p>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/pedidos"
        params={{ status: statusFilter || undefined, q: query || undefined }}
      />
    </div>
  );
}
