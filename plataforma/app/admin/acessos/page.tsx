export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { GrantAccessForm } from "./grant-access-form";
import { RevokeButton } from "./revoke-button";

export const metadata = { title: "Acessos" };

export default async function AdminAcessosPage() {
  const [products, enrollments] = await Promise.all([
    db.product.findMany({ where: { active: true }, orderBy: { title: "asc" } }),
    db.enrollment.findMany({
      orderBy: { grantedAt: "desc" },
      include: {
        user: { select: { email: true, name: true } },
        product: { select: { title: true } },
      },
    }),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-8">Acessos manuais</h1>

      <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-8">
        <h2 className="text-base font-semibold mb-5">Liberar acesso</h2>
        <GrantAccessForm products={products} />
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Usuário</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Produto</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Data</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.id} className="border-b border-zinc-100 last:border-none">
                <td className="px-5 py-4">
                  <div className="font-medium">{e.user.name ?? "—"}</div>
                  <div className="text-xs text-zinc-400">{e.user.email}</div>
                </td>
                <td className="px-5 py-4 text-zinc-600">{e.product.title}</td>
                <td className="px-5 py-4 text-xs text-zinc-400">
                  {new Date(e.grantedAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-5 py-4">
                  <RevokeButton enrollmentId={e.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {enrollments.length === 0 && (
          <p className="text-center text-zinc-500 py-10">Nenhum acesso concedido ainda.</p>
        )}
      </div>
    </div>
  );
}
