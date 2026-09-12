export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import SearchBox from "../_components/SearchBox";
import Pagination from "../_components/Pagination";
import ExportButton from "../_components/ExportButton";
import LeadTabs from "./LeadTabs";
import LeadRow from "./LeadRow";

export const metadata = { title: "Leads · Admin" };

const PAGE_SIZE = 50;

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "emerald" | "violet" | "blue" | "amber";
}) {
  const colors = {
    emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
    violet: "from-violet-500/10 to-violet-500/5 border-violet-500/20",
    blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
    amber: "from-amber-500/10 to-amber-500/5 border-amber-500/20",
  };
  const textColors = {
    emerald: "text-emerald-300",
    violet: "text-violet-300",
    blue: "text-blue-300",
    amber: "text-amber-300",
  };
  const c = accent ?? "violet";
  return (
    <div className={`bg-gradient-to-br ${colors[c]} border rounded-xl px-4 py-3`}>
      <p className="text-xs text-zinc-400 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${textColors[c]}`}>{value}</p>
      {sub && <p className="text-[10px] text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; tab?: string }>;
}) {
  const { q, page: pageParam, tab } = await searchParams;
  const query = q?.trim() ?? "";
  const activeTab = tab || "all";
  const page = Math.max(1, Number(pageParam) || 1);

  const searchWhere = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { email: { contains: query, mode: "insensitive" as const } },
          { phone: { contains: query } },
        ],
      }
    : undefined;

  const activeSubUsers = await db.user.findMany({
    where: { subscription: { status: "ACTIVE" } },
    select: { email: true },
  });
  const activeSet = new Set(activeSubUsers.map((u) => u.email.toLowerCase()));

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalAll, totalWhatsapp, convertedEmails, leadsThisMonth] = await Promise.all([
    db.lead.count({ where: searchWhere }),
    db.lead.count({ where: { ...searchWhere, whatsappOptIn: true } }),
    db.lead.findMany({
      where: { email: { in: [...activeSet] } },
      select: { email: true },
      distinct: ["email"],
    }),
    db.lead.count({ where: { createdAt: { gte: monthStart } } }),
  ]);

  const totalConverted = convertedEmails.length;
  const conversionRate = totalAll > 0 ? ((totalConverted / totalAll) * 100).toFixed(1) : "0";

  const tabWhere =
    activeTab === "converted"
      ? { email: { in: [...activeSet] } }
      : activeTab === "whatsapp"
        ? { whatsappOptIn: true }
        : undefined;

  const combinedWhere =
    searchWhere && tabWhere
      ? { AND: [searchWhere, tabWhere] }
      : searchWhere ?? tabWhere ?? undefined;

  const [filteredTotal, leads] = await Promise.all([
    db.lead.count({ where: combinedWhere }),
    db.lead.findMany({
      where: combinedWhere,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: { product: { select: { title: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));

  const serializedLeads = leads.map((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    profile: l.profile,
    state: l.state,
    university: l.university,
    doePlantoes: l.doePlantoes,
    whatsappOptIn: l.whatsappOptIn,
    productTitle: l.product?.title ?? null,
    createdAt: new Date(l.createdAt).toLocaleDateString("pt-BR"),
    converted: activeSet.has(l.email.toLowerCase()),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Leads</h1>
          <p className="text-sm text-zinc-400 mt-1">Funil de captação e conversão</p>
        </div>
        <ExportButton type="leads" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Total de leads" value={totalAll} accent="violet" />
        <StatCard label="Convertidos" value={totalConverted} sub="assinantes ativos" accent="emerald" />
        <StatCard label="Taxa de conversão" value={`${conversionRate}%`} accent="amber" />
        <StatCard label="WhatsApp opt-in" value={totalWhatsapp} sub="aceitaram contato" accent="blue" />
        <StatCard label="Leads este mês" value={leadsThisMonth} sub={now.toLocaleDateString("pt-BR", { month: "long" })} accent="violet" />
      </div>

      {/* Tabs + Search */}
      <div className="space-y-4">
        <LeadTabs counts={{ all: totalAll, converted: totalConverted, whatsapp: totalWhatsapp }} />
        <SearchBox placeholder="Buscar por nome, e-mail ou telefone…" />
      </div>

      {/* Table */}
      <div className="bg-[#161b22] rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Lead</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 hidden sm:table-cell">Perfil</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 hidden md:table-cell">Produto</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 hidden lg:table-cell">Data</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-400">Status</th>
              <th className="w-8 px-2 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {serializedLeads.map((l) => (
              <LeadRow key={l.id} lead={l} />
            ))}
            {serializedLeads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-zinc-400">
                  {query ? `Nenhum lead para "${query}"` : "Nenhum lead nesta visualização."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/leads"
        params={{ q: query || undefined, tab: activeTab !== "all" ? activeTab : undefined }}
      />
    </div>
  );
}
