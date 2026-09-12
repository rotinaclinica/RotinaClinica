export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { DeleteProductButton } from "./delete-product-button";

export const metadata = { title: "Produtos · Admin" };

export default async function AdminProdutosPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { enrollments: true } } },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Produtos</h1>
          <p className="text-sm text-zinc-400 mt-1">Gerencie cursos e downloads</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="bg-violet-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-violet-700 transition-colors"
        >
          + Novo produto
        </Link>
      </div>

      <div className="bg-[#161b22] rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-zinc-400">Produto</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-400">Tipo</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-400">Preço</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-400">Alunos/Clientes</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-400">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-white/10 last:border-none hover:bg-white/5">
                <td className="px-5 py-4 font-medium text-zinc-100">{p.title}</td>
                <td className="px-5 py-4 text-zinc-400">
                  {p.type === "COURSE" ? "Curso" : "Download"}
                </td>
                <td className="px-5 py-4 text-zinc-100">{formatPrice(p.priceCents, p.currency)}</td>
                <td className="px-5 py-4 text-zinc-100">{p._count.enrollments}</td>
                <td className="px-5 py-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      p.active
                        ? "bg-green-500/20 text-green-300"
                        : "bg-white/10 text-zinc-400"
                    }`}
                  >
                    {p.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-5 py-4 flex items-center gap-3">
                  <Link href={`/admin/produtos/${p.id}`} className="text-violet-400 hover:text-violet-300 text-xs font-medium">
                    Editar
                  </Link>
                  <DeleteProductButton productId={p.id} title={p.title} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center text-zinc-400 py-10">Nenhum produto cadastrado.</p>
        )}
      </div>
    </div>
  );
}
