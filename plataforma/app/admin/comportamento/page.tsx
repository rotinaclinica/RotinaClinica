export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/require-admin";
import { getExcludedEmails } from "../_lib/excluded-emails";

export const metadata = { title: "Comportamento · Admin · Rotina Clínica" };

const fmt = (d: Date) =>
  new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

const fmtDaysAgo = (d: Date | null | undefined) => {
  if (!d) return "nunca";
  const days = Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "hoje";
  if (days === 1) return "ontem";
  return `há ${days} dias`;
};

// Nome amigável para paths conhecidos
const PATH_LABELS: Record<string, string> = {
  "/dashboard": "Home dashboard",
  "/dashboard/prescricoes": "Lista de prescrições",
  "/dashboard/evolucoes": "Lista de evoluções",
  "/dashboard/calculadoras": "Calculadoras",
  "/dashboard/cursos": "Cursos",
  "/dashboard/casos": "Casos clínicos",
  "/dashboard/materiais": "Materiais",
  "/dashboard/perfil": "Meu perfil",
  "/dashboard/quiz": "Quiz",
  "/dashboard/pedidos": "Meus pedidos",
  "/dashboard/meus-ebooks": "Meus ebooks",
};

function labelForPath(path: string): string {
  if (PATH_LABELS[path]) return PATH_LABELS[path];
  // Prescrição específica
  const presc = path.match(/^\/dashboard\/prescricoes\/(\d+)$/);
  if (presc) return `Prescrição #${presc[1]}`;
  const evol = path.match(/^\/dashboard\/evolucoes\/(\d+)$/);
  if (evol) return `Evolução #${evol[1]}`;
  const calc = path.match(/^\/dashboard\/calculadoras\/([^/]+)$/);
  if (calc) return `Calculadora ${calc[1]}`;
  const curso = path.match(/^\/(?:dashboard\/)?curso\/([^/]+)/);
  if (curso) return `Curso ${curso[1]}`;
  return path;
}

export default async function ComportamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  if (!(await isAdminRequest())) redirect("/dashboard");

  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const excludedEmails = await getExcludedEmails();

  // 1. Perfil do usuário buscado
  let userProfile: {
    id: string;
    name: string | null;
    email: string;
    lastSeenAt: Date | null;
    subscription: { status: string; currentPeriodEnd: Date } | null;
  } | null = null;
  let userViews: { path: string; createdAt: Date }[] = [];

  if (query) {
    const found = await db.user.findFirst({
      where: { email: { equals: query.toLowerCase(), mode: "insensitive" } },
      select: {
        id: true, name: true, email: true, lastSeenAt: true,
        subscription: { select: { status: true, currentPeriodEnd: true } },
      },
    });
    if (found) {
      userProfile = found;
      userViews = await db.pageView.findMany({
        where: { userId: found.id, createdAt: { gte: since30 } },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: { path: true, createdAt: true },
      });
    }
  }

  // Lista de assinantes ativos p/ o seletor (exclui admin/tester/cortesia/embaixador)
  const activeSubscribers = await db.user.findMany({
    where: {
      anonymizedAt: null,
      role: "CUSTOMER",
      email: { notIn: excludedEmails },
      subscription: { status: "ACTIVE", currentPeriodEnd: { gt: new Date() } },
    },
    select: { id: true, name: true, email: true, lastSeenAt: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
  });

  // 2. Páginas mais quentes (assinantes ACTIVE nos últimos 7 dias)
  // exclui admin/tester/cortesia/embaixador/anonimizado
  const topPaths = excludedEmails.length
    ? await db.$queryRaw<{ path: string; hits: bigint; users: bigint }[]>`
        SELECT pv.path AS path,
               COUNT(*)::bigint AS hits,
               COUNT(DISTINCT pv."userId")::bigint AS users
        FROM "PageView" pv
        JOIN "User" u ON u.id = pv."userId"
        JOIN "Subscription" s ON s."userId" = u.id
        WHERE pv."createdAt" >= ${since7}
          AND s.status = 'ACTIVE'
          AND u.role = 'CUSTOMER'
          AND u."anonymizedAt" IS NULL
          AND u.email <> ALL(${excludedEmails}::text[])
        GROUP BY pv.path
        ORDER BY hits DESC
        LIMIT 20
      `
    : await db.$queryRaw<{ path: string; hits: bigint; users: bigint }[]>`
        SELECT pv.path AS path,
               COUNT(*)::bigint AS hits,
               COUNT(DISTINCT pv."userId")::bigint AS users
        FROM "PageView" pv
        JOIN "User" u ON u.id = pv."userId"
        JOIN "Subscription" s ON s."userId" = u.id
        WHERE pv."createdAt" >= ${since7}
          AND s.status = 'ACTIVE'
          AND u.role = 'CUSTOMER'
          AND u."anonymizedAt" IS NULL
        GROUP BY pv.path
        ORDER BY hits DESC
        LIMIT 20
      `;

  // 3. Assinantes ativos em risco (não acessa há 10+ dias, período vigente > 7 dias)
  // exclui admin/tester/cortesia/embaixador
  const now = new Date();
  const churnRisk = await db.user.findMany({
    where: {
      role: "CUSTOMER",
      email: { notIn: excludedEmails },
      anonymizedAt: null,
      subscription: { status: "ACTIVE", currentPeriodEnd: { gt: now } },
      OR: [
        { lastSeenAt: null },
        { lastSeenAt: { lt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) } },
      ],
    },
    select: {
      id: true, name: true, email: true, lastSeenAt: true,
      subscription: { select: { plan: true, currentPeriodEnd: true } },
    },
    orderBy: [{ lastSeenAt: "asc" }],
    take: 50,
  });

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Comportamento</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Navegação de usuários no dashboard. Dados retidos por 90 dias (LGPD).
          </p>
        </div>
        <Link href="/admin" className="text-sm text-violet-400 hover:underline">← Admin</Link>
      </div>

      {/* 1. Perfil de usuário */}
      <section>
        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wide mb-3">
          Perfil de navegação (últimos 30 dias)
        </h2>
        <form action="" method="get" className="mb-3 flex flex-wrap items-center gap-2">
          <select
            name="q"
            defaultValue={query}
            className="w-full sm:w-96 bg-[#161b22] border border-white/10 rounded-lg px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">— Selecione um assinante ativo ({activeSubscribers.length}) —</option>
            {activeSubscribers.map((u) => (
              <option key={u.id} value={u.email}>
                {(u.name?.trim() || "(sem nome)")} — {u.email}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Ver
          </button>
          {query && (
            <a
              href="/admin/comportamento"
              className="text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-2"
            >
              limpar
            </a>
          )}
        </form>
        <p className="text-xs text-zinc-500 mb-3">
          Só assinantes ativos aparecem no seletor. Para outros usuários, use a URL <span className="font-mono">?q=email@...</span>
        </p>

        {query && !userProfile && (
          <div className="bg-[#161b22] rounded-xl border border-white/10 p-6 text-center text-zinc-400 text-sm">
            Nenhum usuário com esse e-mail.
          </div>
        )}

        {userProfile && (
          <div className="bg-[#161b22] rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-zinc-100">{userProfile.name ?? "(sem nome)"}</p>
                <p className="text-xs text-zinc-400">{userProfile.email}</p>
              </div>
              <div className="text-right text-xs">
                <p className="text-zinc-400">
                  Último acesso: <span className="text-zinc-200">{fmtDaysAgo(userProfile.lastSeenAt)}</span>
                </p>
                {userProfile.subscription && (
                  <p className="text-zinc-400 mt-1">
                    Assinatura: <span className="text-zinc-200">{userProfile.subscription.status}</span>
                  </p>
                )}
                <Link
                  href={`/admin/usuarios/${userProfile.id}`}
                  className="text-violet-400 hover:underline text-xs mt-1 inline-block"
                >
                  Ver na página do usuário →
                </Link>
              </div>
            </div>

            {userViews.length === 0 ? (
              <div className="p-6 text-center text-sm text-zinc-400">
                Sem navegação registrada nos últimos 30 dias.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left px-4 py-2 text-xs font-semibold text-zinc-400">Quando</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-zinc-400">Página</th>
                  </tr>
                </thead>
                <tbody>
                  {userViews.map((v, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      <td className="px-4 py-2 text-zinc-400 text-xs whitespace-nowrap">{fmt(v.createdAt)}</td>
                      <td className="px-4 py-2 text-zinc-200 text-xs">
                        {labelForPath(v.path)}{" "}
                        <span className="text-zinc-500 font-mono text-[10px]">{v.path}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>

      {/* 2. Top páginas */}
      <section>
        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wide mb-3">
          Páginas mais acessadas por assinantes ativos (últimos 7 dias)
        </h2>
        <div className="bg-[#161b22] rounded-xl border border-white/10 overflow-hidden">
          {topPaths.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-400">
              Sem dados ainda. Aguarde alguns dias para os assinantes navegarem.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-zinc-400">Página</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-zinc-400">Visitas</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-zinc-400">Usuários únicos</th>
                </tr>
              </thead>
              <tbody>
                {topPaths.map((p, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-2 text-zinc-200 text-xs">
                      {labelForPath(p.path)}{" "}
                      <span className="text-zinc-500 font-mono text-[10px]">{p.path}</span>
                    </td>
                    <td className="px-4 py-2 text-right text-zinc-300 text-xs font-mono">{String(p.hits)}</td>
                    <td className="px-4 py-2 text-right text-zinc-300 text-xs font-mono">{String(p.users)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* 3. Risco de churn */}
      <section>
        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wide mb-3">
          Assinantes ativos em risco de churn (não acessam há 10+ dias)
        </h2>
        <div className="bg-[#161b22] rounded-xl border border-white/10 overflow-hidden">
          {churnRisk.length === 0 ? (
            <div className="p-6 text-center text-sm text-emerald-400">
              ✅ Nenhum assinante ativo abandonado no momento.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-zinc-400">Usuário</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-zinc-400">Plano</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-zinc-400">Vence em</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-zinc-400">Último acesso</th>
                </tr>
              </thead>
              <tbody>
                {churnRisk.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                    <td className="px-4 py-2">
                      <Link href={`/admin/usuarios/${u.id}`} className="text-zinc-200 hover:text-violet-400">
                        <p className="text-xs font-medium">{u.name ?? "(sem nome)"}</p>
                        <p className="text-[10px] text-zinc-400">{u.email}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-zinc-300 text-xs">
                      {u.subscription?.plan === "ANNUAL" ? "Anual" : "Mensal"}
                    </td>
                    <td className="px-4 py-2 text-zinc-400 text-xs">
                      {u.subscription?.currentPeriodEnd
                        ? new Date(u.subscription.currentPeriodEnd).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-amber-300 text-xs">{fmtDaysAgo(u.lastSeenAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
