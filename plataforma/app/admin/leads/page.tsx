export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import SearchBox from "../_components/SearchBox";
import Pagination from "../_components/Pagination";
import ExportButton from "../_components/ExportButton";

export const metadata = { title: "Leads · Admin" };

const PAGE_SIZE = 50;

export default async function AdminLeadsPage({
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
          { phone: { contains: query } },
        ],
      }
    : undefined;

  // Assinantes ativos são poucos (clientes pagantes) → barato de listar e usar
  // tanto para o badge global de convertidos quanto para a tag por linha.
  const activeSubUsers = await db.user.findMany({
    where: { subscription: { status: "ACTIVE" } },
    select: { email: true },
  });
  const activeSet = new Set(activeSubUsers.map((u) => u.email.toLowerCase()));

  const [total, leads, convertidosLeads] = await Promise.all([
    db.lead.count({ where }),
    db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: { product: { select: { title: true } } },
    }),
    db.lead.findMany({
      where: { email: { in: [...activeSet] } },
      select: { email: true },
      distinct: ["email"],
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Leads</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Usuários cadastrados via produtos gratuitos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1.5 rounded-lg">
            {convertidosLeads.length} convertido{convertidosLeads.length !== 1 ? "s" : ""}
          </span>
          <span className="bg-violet-100 text-violet-700 text-sm font-bold px-3 py-1.5 rounded-lg">
            {total} lead{total !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <SearchBox placeholder="Buscar por nome, e-mail ou telefone…" />
        <ExportButton type="leads" />
      </div>

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
                  <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">{l.product?.title ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    {activeSet.has(l.email.toLowerCase()) && (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">Convertido</span>
                    )}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-zinc-400">
                    {query ? `Nenhum lead para "${query}"` : "Nenhum lead cadastrado ainda."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/admin/leads" params={{ q: query || undefined }} />
    </div>
  );
}
