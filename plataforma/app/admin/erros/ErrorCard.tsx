"use client";

import { useState, useEffect } from "react";
import { CopyButton } from "./CopyButton";

interface Props {
  id: string;
  method: string;
  route: string;
  message: string;
  date: string;
  userId?: string | null;
  stack?: string | null;
  deleteAction: () => Promise<void>;
}

export function ErrorCard({ id, method, route, message, date, userId, stack, deleteAction }: Props) {
  const key = `err_resolved_${id}`;
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    try { setResolved(localStorage.getItem(key) === "1"); } catch {}
  }, [key]);

  function toggleResolved(ev: React.MouseEvent) {
    ev.stopPropagation();
    try {
      if (resolved) { localStorage.removeItem(key); setResolved(false); }
      else { localStorage.setItem(key, "1"); setResolved(true); }
    } catch {}
  }

  return (
    <details className={`border rounded-xl overflow-hidden transition-colors ${
      resolved
        ? "bg-green-500/10 dark:bg-green-950/30 border-green-500/30 dark:border-green-900"
        : "bg-[#161b22] dark:bg-zinc-800/60 border-white/10 dark:border-white/8"
    }`}>
      <summary className="flex items-start justify-between gap-4 px-4 py-3 cursor-pointer hover:bg-white/5 dark:hover:bg-white/5 transition-colors list-none">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/10 dark:bg-white/10 text-zinc-400 dark:text-zinc-400 font-mono">
              {method}
            </span>
            <span className={`text-sm font-semibold font-mono truncate ${resolved ? "line-through text-zinc-400 dark:text-zinc-400" : "text-zinc-400 dark:text-zinc-200"}`}>
              {route}
            </span>
            {resolved && (
              <span className="text-[11px] font-semibold text-green-400 dark:text-green-400">✓ Resolvido</span>
            )}
          </div>
          <p className={`text-sm mt-1 truncate ${resolved ? "text-zinc-400 dark:text-zinc-400" : "text-red-500 dark:text-red-400"}`}>
            {message}
          </p>
        </div>
        <div className="text-right shrink-0 flex flex-col items-end gap-1">
          <p className="text-xs text-zinc-400">{date}</p>
          {userId && (
            <p className="text-[11px] text-zinc-400">user: {userId.slice(0, 8)}…</p>
          )}
          <div className="flex gap-1.5" onClick={(ev) => ev.stopPropagation()}>
            <button
              onClick={toggleResolved}
              title={resolved ? "Marcar como pendente" : "Marcar como resolvido"}
              className={`text-[11px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                resolved
                  ? "border-green-300 dark:border-green-800 text-green-400 dark:text-green-400 hover:bg-green-500/20 dark:hover:bg-green-900"
                  : "border-white/10 dark:border-white/10 text-zinc-400 hover:border-green-300 hover:text-green-400 dark:hover:border-green-800 dark:hover:text-green-400"
              }`}
            >
              {resolved ? "✓ OK" : "✓"}
            </button>
            <form action={deleteAction}>
              <button
                type="submit"
                className="text-[11px] font-semibold px-2 py-0.5 rounded border border-red-500/30 dark:border-red-900 text-red-400 hover:bg-red-500/10 dark:hover:bg-red-950 hover:text-red-400 transition-colors"
              >
                Excluir
              </button>
            </form>
          </div>
        </div>
      </summary>
      {stack && (
        <div className="border-t border-white/10 dark:border-white/6 px-4 py-3">
          <div className="flex justify-end mb-2">
            <CopyButton text={`${message}\n\n${stack}`} />
          </div>
          <pre className="text-[11px] text-zinc-400 dark:text-zinc-400 whitespace-pre-wrap break-all leading-relaxed overflow-x-auto">
            {stack}
          </pre>
        </div>
      )}
    </details>
  );
}
