export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Produtos" };

export default async function AdminProdutosPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { enrollments: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="bg-violet-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-violet-700 transition-colors"
        >
          + Novo produto
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Produto</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Tipo</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Preço</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Alunos/Clientes</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-zinc-100 last:border-none">
                <td className="px-5 py-4 font-medium">{p.title}</td>
                <td className="px-5 py-4 text-zinc-500">
                  {p.type === "COURSE" ? "Curso" : "Download"}
                </td>
                <td className="px-5 py-4">{formatPrice(p.priceCents, p.currency)}</td>
                <td className="px-5 py-4">{p._count.enrollments}</td>
                <td className="px-5 py-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.active
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {p.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/produtos/${p.id}`}
                    className="text-violet-600 hover:underline text-xs"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center text-zinc-500 py-10">Nenhum produto cadastrado.</p>
        )}
      </div>
    </div>
  );
}
