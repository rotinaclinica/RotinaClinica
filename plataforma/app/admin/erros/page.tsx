export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export const metadata = { title: "Erros · Admin Rotina Clínica" };

export default async function ErrosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; route?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== "ADMIN") redirect("/dashboard");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const PAGE_SIZE = 30;
  const routeFilter = params.route?.trim() || undefined;

  const where = routeFilter ? { route: { contains: routeFilter } } : {};

  const [errors, total] = await Promise.all([
    db.errorLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.errorLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
        <h1 className="text-xl font-extrabold text-zinc-800 dark:text-zinc-100">Erros de servidor</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
          {total} registro{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
        </p>
      </header>

      <main className="flex-1 p-6 sm:p-8 space-y-4">

        {/* Filtro por rota */}
        <form method="GET" className="flex gap-2 max-w-md">
          <input
            name="route"
            defaultValue={routeFilter ?? ""}
            placeholder="Filtrar por rota (ex: /api/refund)"
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold bg-zinc-800 dark:bg-zinc-700 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Filtrar
          </button>
          {routeFilter && (
            <a
              href="/admin/erros"
              className="px-4 py-2 text-sm font-semibold border border-zinc-200 dark:border-white/10 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors"
            >
              Limpar
            </a>
          )}
        </form>

        {errors.length === 0 ? (
          <div className="py-20 text-center text-zinc-400">
            <p className="text-lg font-medium">Nenhum erro registrado</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl">
            {errors.map((e) => (
              <details
                key={e.id}
                className="bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-white/8 rounded-xl overflow-hidden"
              >
                <summary className="flex items-start justify-between gap-4 px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors list-none">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 font-mono">
                        {e.method}
                      </span>
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 font-mono truncate">
                        {e.route}
                      </span>
                    </div>
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1 truncate">{e.message}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-zinc-400">
                      {e.createdAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                      {" "}
                      {e.createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {e.userId && (
                      <p className="text-[11px] text-zinc-400 mt-0.5">user: {e.userId.slice(0, 8)}…</p>
                    )}
                  </div>
                </summary>
                {e.stack && (
                  <div className="border-t border-zinc-100 dark:border-white/6 px-4 py-3">
                    <pre className="text-[11px] text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap break-all leading-relaxed overflow-x-auto">
                      {e.stack}
                    </pre>
                  </div>
                )}
              </details>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex gap-2 pt-2">
            {page > 1 && (
              <a
                href={`/admin/erros?page=${page - 1}${routeFilter ? `&route=${encodeURIComponent(routeFilter)}` : ""}`}
                className="px-3 py-1.5 text-sm border border-zinc-200 dark:border-white/10 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5"
              >
                ← Anterior
              </a>
            )}
            <span className="px-3 py-1.5 text-sm text-zinc-400">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <a
                href={`/admin/erros?page=${page + 1}${routeFilter ? `&route=${encodeURIComponent(routeFilter)}` : ""}`}
                className="px-3 py-1.5 text-sm border border-zinc-200 dark:border-white/10 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5"
              >
                Próxima →
              </a>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
