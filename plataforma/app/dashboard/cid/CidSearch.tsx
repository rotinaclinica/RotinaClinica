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
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a6aad] dark:text-[#3db8d4] pointer-events-none">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Digite um código (ex: J18) ou nome da doença (ex: pneumonia)"
          className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#bcd3e6] dark:border-white/20 bg-white dark:bg-[#1b2e4c] text-[#0f2d4a] dark:text-[#e8edf5] placeholder:text-[#6b8aa3] dark:placeholder:text-[#bccbd8] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6aad]/40 shadow-sm"
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
        <div className="flex flex-wrap gap-2 text-xs text-[#0f2d4a]/75 dark:text-[#bccbd8]">
          <span className="py-0.5 font-medium">Exemplos:</span>
          {["J18", "I10", "diabetes", "hipertensão", "dengue", "K35"].map((ex) => (
            <button
              key={ex}
              onClick={() => { setQuery(ex); search(ex); }}
              className="px-2.5 py-0.5 rounded-md bg-[#e8f4fc] text-[#1a6aad] dark:bg-[#3db8d4]/12 dark:text-[#cfe6f2] ring-1 ring-[#1a6aad]/20 dark:ring-[#3db8d4]/25 font-semibold hover:bg-[#d3e9f7] dark:hover:bg-[#3db8d4]/25 transition-colors font-mono"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Resultados */}
      {searched && results.length === 0 && !loading && (
        <div className="flex flex-col items-center text-center py-12">
          <div className="w-16 h-16 bg-[#e8f4fc] dark:bg-[#3db8d4]/15 ring-1 ring-[#1a6aad]/10 dark:ring-[#3db8d4]/25 rounded-2xl flex items-center justify-center mb-4">
            <svg className="text-[#1a6aad] dark:text-[#3db8d4]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <p className="font-bold text-[#0f2d4a] dark:text-white mb-1">
            Nenhum resultado para <span className="text-[#1a6aad] dark:text-[#3db8d4]">&quot;{query}&quot;</span>
          </p>
          <p className="text-sm text-[#0f2d4a]/70 dark:text-[#bccbd8]">Tente o código (ex: J18) ou outro nome da doença.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-1.5">
          {results.length === 50 && (
            <p className="text-xs text-zinc-400 dark:text-[#a3b8c9] pb-1">Mostrando os primeiros 50 resultados. Refine a busca para mais precisão.</p>
          )}
          {results.map((r) => (
            <div
              key={r.code}
              className="flex items-center gap-3 bg-white dark:bg-[#172741] border border-[#d9e3ec] dark:border-white/12 rounded-xl px-4 py-3 hover:border-[#1a6aad]/40 dark:hover:border-[#3db8d4]/30 transition-colors group"
            >
              <span className="font-mono text-sm font-bold text-[#1a6aad] dark:text-[#3db8d4] bg-[#e8f4fc] dark:bg-[#132842] px-2.5 py-1 rounded-lg flex-shrink-0 min-w-[4rem] text-center">
                {r.code}
              </span>
              <span className="text-sm text-[#0f2d4a] dark:text-[#e8edf5] leading-snug">
                {r.descricao}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
