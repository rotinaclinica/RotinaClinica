"use client";

import { useState, useRef, useCallback } from "react";

type Result = { code: string; descricao: string };

export default function CidSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cid?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        setResults(data);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    search(v);
  }

  return (
    <div className="space-y-4">
      {/* Campo de busca */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Digite um código (ex: J18) ou nome da doença (ex: pneumonia)"
          className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131c2e] text-[#0f2d4a] dark:text-[#e8edf5] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6aad]/40 shadow-sm"
          autoFocus
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <span className="animate-spin w-4 h-4 border-2 border-[#1a6aad] border-t-transparent rounded-full block" />
          </div>
        )}
      </div>

      {/* Dica */}
      {!searched && (
        <div className="flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>Exemplos:</span>
          {["J18", "I10", "diabetes", "hipertensão", "dengue", "K35"].map((ex) => (
            <button
              key={ex}
              onClick={() => { setQuery(ex); search(ex); }}
              className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-white/8 hover:bg-zinc-200 dark:hover:bg-white/12 transition-colors font-mono"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Resultados */}
      {searched && results.length === 0 && !loading && (
        <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-sm">
          Nenhum resultado encontrado para <span className="font-semibold text-zinc-600 dark:text-zinc-300">&quot;{query}&quot;</span>.
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-1.5">
          {results.length === 50 && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 pb-1">Mostrando os primeiros 50 resultados. Refine a busca para mais precisão.</p>
          )}
          {results.map((r) => (
            <div
              key={r.code}
              className="flex items-center gap-3 bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-xl px-4 py-3 hover:border-[#1a6aad]/40 dark:hover:border-[#3db8d4]/30 transition-colors group"
            >
              <span className="font-mono text-sm font-bold text-[#1a6aad] dark:text-[#3db8d4] bg-[#e8f4fc] dark:bg-[#0f1e30] px-2.5 py-1 rounded-lg flex-shrink-0 min-w-[4rem] text-center">
                {r.code}
              </span>
              <span className="text-sm text-[#0f2d4a] dark:text-[#d4dce8] leading-snug">
                {r.descricao}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
