"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { evolucoesMeta, type EvolucaoMeta } from "@/lib/evolucoes-meta";
import EvolucaoContent from "./EvolucaoContent";

// ── Content loader ────────────────────────────────────────────────────────────
function useConteudo(id: string) {
  const [conteudo, setConteudo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true); setError(""); setConteudo(null);
    fetch(`/api/evolucoes/${id}`)
      .then(r => r.json())
      .then(d => { setConteudo(d.conteudo ?? null); if (d.error) setError(d.error); })
      .catch(() => setError("Erro ao carregar."))
      .finally(() => setLoading(false));
  }, [id]);

  return { conteudo, loading, error };
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function EvolucaoModal({ item, onClose }: { item: EvolucaoMeta; onClose: () => void }) {
  const { conteudo, loading, error } = useConteudo(item.id);

  return (
    <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-[#131c2e] w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-2xl shadow-2xl flex flex-col sm:max-h-[85dvh]">
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-zinc-200 dark:border-white/8 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#3db8d4] uppercase tracking-widest mb-1">
              Modelo de evolução
            </p>
            <h2 className="font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] text-lg leading-snug">
              {item.titulo}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-200 dark:bg-white/40 hover:bg-zinc-300 dark:hover:bg-white/55 text-zinc-700 dark:text-white flex items-center justify-center transition-colors mt-0.5"
            aria-label="Fechar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 pb-24 sm:pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#1a6aad] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : conteudo ? (
            <EvolucaoContent conteudo={conteudo} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EvolucoesPag() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<EvolucaoMeta | null>(null);

  const resultados = useMemo(() => {
    const q = query.toLowerCase().trim();
    const filtered = !q
      ? [...evolucoesMeta]
      : evolucoesMeta.filter(e =>
          e.titulo.toLowerCase().includes(q) ||
          e.tags.some(t => t.toLowerCase().includes(q))
        );
    return filtered.sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
  }, [query]);

  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <>
      {selected && <EvolucaoModal item={selected} onClose={handleClose} />}

      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-[#0f2d4a] dark:text-[#4a6a7e] hover:text-[#1a6aad] dark:hover:text-[#3db8d4] mb-3 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Início
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] mb-1">
            Modelos de evolução
          </h1>
          <p className="text-[#0f2d4a] dark:text-[#6a8fa5] text-sm">
            Modelos prontos para você usar na sua prática clínica.
          </p>

          {/* Search */}
          <div className="relative mt-4 max-w-xl">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0f2d4a] dark:text-[#4a6a7e]"
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ex: cefaleia, ITU, dengue, asma..."
              className="w-full pl-11 pr-10 py-3 border border-zinc-300 dark:border-white/10 rounded-2xl text-sm text-zinc-900 dark:text-[#e8edf5] placeholder:text-zinc-400 dark:placeholder:text-[#4a6a7e] focus:outline-none focus:ring-2 focus:ring-[#1a6aad] focus:border-transparent bg-[#f8fafc] dark:bg-[#0e1825]"
            />
            {query && (
              <button onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0f2d4a] dark:text-[#4a6a7e] hover:text-zinc-600 dark:hover:text-[#9ec4de]"
                aria-label="Limpar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8">
          {resultados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-[#1a2535] rounded-2xl flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <p className="font-bold text-[#0f2d4a] dark:text-[#7d96ad] mb-1">Nenhum modelo encontrado</p>
              <p className="text-sm text-[#0f2d4a] dark:text-[#5a7a8e]">Tente outro diagnóstico ou queixa.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#0f2d4a] dark:text-[#4a6a7e] mb-4 font-medium">
                {resultados.length} modelo{resultados.length !== 1 ? "s" : ""}
                {query ? ` para "${query}"` : ""}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {resultados.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setSelected(e)}
                    className="text-left bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-2xl p-5 hover:shadow-md hover:border-[#3db8d4] dark:hover:border-[#3db8d4]/60 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e8f4fc] to-[#dceef9] dark:from-[#1a2d45] dark:to-[#162438] flex items-center justify-center mb-3">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a6aad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-[#0f2d4a] dark:text-[#d4dce8] text-sm leading-snug group-hover:text-[#1a6aad] dark:group-hover:text-[#3db8d4] transition-colors">
                      {e.titulo}
                    </h3>
                  </button>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
