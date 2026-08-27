import Link from "next/link";

/**
 * Paginação server-side via querystring. Preserva os demais params (q, status…).
 */
export default function Pagination({
  page,
  totalPages,
  basePath,
  params = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v);
    }
    sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  const linkCls =
    "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors";
  const enabled = "bg-white border-zinc-200 text-zinc-600 hover:border-violet-400";
  const disabled = "bg-zinc-50 border-zinc-100 text-zinc-300 pointer-events-none";

  return (
    <div className="flex items-center justify-between gap-3">
      <Link href={href(prev)} className={`${linkCls} ${page <= 1 ? disabled : enabled}`}>
        ← Anterior
      </Link>
      <span className="text-xs text-zinc-500">
        Página <span className="font-semibold text-zinc-700">{page}</span> de {totalPages}
      </span>
      <Link href={href(next)} className={`${linkCls} ${page >= totalPages ? disabled : enabled}`}>
        Próxima →
      </Link>
    </div>
  );
}
