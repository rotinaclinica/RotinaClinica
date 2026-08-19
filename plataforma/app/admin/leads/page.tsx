export const dynamic = "force-dynamic";

import { db } from "@/lib/db";

export const metadata = { title: "Leads · Admin" };

export default async function AdminLeadsPage() {
  const [leads, totalLeads] = await Promise.all([
    db.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: { select: { title: true } } },
    }),
    db.lead.count(),
  ]);

  const convertidos = await db.user.findMany({
    where: {
      email: { in: leads.map((l) => l.email) },
      subscription: { status: "ACTIVE" },
    },
    select: { email: true },
  });
  const convertidosSet = new Set(convertidos.map((u) => u.email));

  const byProduct: Record<string, number> = {};
  for (const l of leads) {
    const title = l.product.title;
    byProduct[title] = (byProduct[title] ?? 0) + 1;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Leads</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Usuários cadastrados via produtos gratuitos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1.5 rounded-lg">
            {convertidosSet.size} convertido{convertidosSet.size !== 1 ? "s" : ""}
          </span>
          <span className="bg-violet-100 text-violet-700 text-sm font-bold px-3 py-1.5 rounded-lg">
            {totalLeads} lead{totalLeads !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Resumo por produto */}
      {Object.keys(byProduct).length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(byProduct).map(([title, count]) => (
            <div key={title} className="bg-white border border-zinc-200 rounded-xl px-4 py-3">
              <p className="text-xs text-zinc-500 mb-0.5">{title}</p>
              <p className="text-xl font-bold text-zinc-900">{count}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 whitespace-nowrap">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 whitespace-nowrap">E-mail</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 whitespace-nowrap">Telefone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 whitespace-nowrap">Perfil</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 whitespace-nowrap">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 whitespace-nowrap">Faz plantão</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 whitespace-nowrap">WhatsApp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 whitespace-nowrap">Produto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 whitespace-nowrap">Data</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 align-top">
                  <td className="px-4 py-3 font-medium text-zinc-900 whitespace-nowrap">{l.name}</td>
                  <td className="px-4 py-3 text-zinc-600">{l.email}</td>
                  <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">{l.phone}</td>
                  <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">{l.profile}</td>
                  <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">{l.state}</td>
                  <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">{l.doePlantoes}</td>
                  <td className="px-4 py-3">
                    {l.whatsappOptIn ? (
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Sim</span>
                    ) : (
                      <span className="bg-zinc-100 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded-full">Não</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">{l.product.title}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    {convertidosSet.has(l.email) && (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">Convertido</span>
                    )}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-zinc-400">
                    Nenhum lead cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
