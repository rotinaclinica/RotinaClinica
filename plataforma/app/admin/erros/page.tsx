export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { ErrorCard } from "./ErrorCard";
import { deleteError } from "./actions";

export const metadata = { title: "Erros · Admin Rotina Clínica" };

export default async function ErrosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; route?: string }>;
}) {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Erros de servidor</h1>
        <p className="text-zinc-400 text-sm mt-1">
          {total} registro{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-4">

        {/* Filtro por rota */}
        <form method="GET" className="flex gap-2 max-w-md">
          <input
            name="route"
            defaultValue={routeFilter ?? ""}
            placeholder="Filtrar por rota (ex: /api/refund)"
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-white/10 dark:border-white/10 bg-[#161b22] dark:bg-zinc-800 text-zinc-100 dark:text-zinc-100 placeholder:text-zinc-400"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors"
          >
            Filtrar
          </button>
          {routeFilter && (
            <a
              href="/admin/erros"
              className="px-4 py-2 text-sm font-semibold border border-white/10 dark:border-white/10 rounded-lg text-zinc-400 hover:text-zinc-100 dark:hover:text-zinc-100 transition-colors"
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
              <ErrorCard
                key={e.id}
                id={e.id}
                method={e.method}
                route={e.route}
                message={e.message}
                date={`${e.createdAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })} ${e.createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
                userId={e.userId}
                stack={e.stack}
                deleteAction={deleteError.bind(null, e.id)}
              />
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex gap-2 pt-2">
            {page > 1 && (
              <a
                href={`/admin/erros?page=${page - 1}${routeFilter ? `&route=${encodeURIComponent(routeFilter)}` : ""}`}
                className="px-3 py-1.5 text-sm border border-white/10 dark:border-white/10 rounded-lg text-zinc-400 dark:text-zinc-300 hover:bg-white/5 dark:hover:bg-white/5"
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
                className="px-3 py-1.5 text-sm border border-white/10 dark:border-white/10 rounded-lg text-zinc-400 dark:text-zinc-300 hover:bg-white/5 dark:hover:bg-white/5"
              >
                Próxima →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
