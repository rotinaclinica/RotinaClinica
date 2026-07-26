export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const [productCount, orderCount, customerCount, revenue] = await Promise.all([
    db.product.count({ where: { active: true } }),
    db.order.count({ where: { status: "PAID" } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.aggregate({
      where: { status: "PAID" },
      _sum: { totalCents: true },
    }),
  ]);

  const stats = [
    { label: "Produtos ativos", value: productCount },
    { label: "Vendas confirmadas", value: orderCount },
    { label: "Clientes", value: customerCount },
    {
      label: "Receita total",
      value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
        (revenue._sum.totalCents ?? 0) / 100
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Painel Admin</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-zinc-200 p-5">
            <p className="text-sm text-zinc-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <Link
          href="/admin/produtos/novo"
          className="bg-violet-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-violet-700 transition-colors"
        >
          + Novo produto
        </Link>
        <Link
          href="/admin/pedidos"
          className="border border-zinc-300 text-zinc-700 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-zinc-100 transition-colors"
        >
          Ver pedidos
        </Link>
      </div>
    </div>
  );
}
