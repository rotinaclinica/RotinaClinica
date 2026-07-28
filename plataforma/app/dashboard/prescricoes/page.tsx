"use client";

import { useState, useMemo, useCallback } from "react";
import { prescricoesMeta, categorias, type PrescricaoMeta } from "@/lib/prescricoes-meta";

// ── Detail Modal ──────────────────────────────────────────────────────────────
function PrescricaoModal({ item, onClose }: { item: PrescricaoMeta; onClose: () => void }) {
  const [conteudo, setConteudo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useMemo(() => {
    setLoading(true); setError(""); setConteudo(null);
    fetch(`/api/prescricoes/${item.id}`)
      .then(r => r.json())
      .then(d => { setConteudo(d.conteudo ?? null); setError(d.error ?? ""); })
      .catch(() => setError("Erro ao carregar."))
      .finally(() => setLoading(false));
  }, [item.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85dvh]">
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-zinc-200 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold bg-[#e8f4fc] text-[#1a6aad] px-2.5 py-1 rounded-full uppercase tracking-wide">
              {item.categoria}
            </span>
            <h2 className="font-extrabold text-[#0f2d4a] text-lg leading-snug mt-2">{item.titulo}</h2>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.tags.map(t => (
                <span key={t} className="text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors mt-0.5"
            aria-label="Fechar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#1a6aad] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {error && <p className="text-red-500 text-sm text-center py-8">{error}</p>}
          {conteudo && (
            <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-700 leading-relaxed">
              {conteudo}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PrescricoesPage() {
  const [query, setQuery] = useState("");
  const [catAtiva, setCatAtiva] = useState("Todos");
  const [selected, setSelected] = useState<PrescricaoMeta | null>(null);

  const resultados = useMemo(() => {
    const q = query.toLowerCase().trim();
    return prescricoesMeta.filter((p) => {
      const matchCat = catAtiva === "Todos" || p.categoria === catAtiva;
      if (!q) return matchCat;
      const matchQ =
        p.titulo.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [query, catAtiva]);

  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <>
      {selected && <PrescricaoModal item={selected} onClose={handleClose} />}

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-zinc-200 px-6 sm:px-8 py-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] mb-1">Prescrições</h1>
          <p className="text-zinc-500 text-sm">Busque por queixa, diagnóstico ou medicamento.</p>

          {/* Search */}
          <div className="relative mt-4 max-w-xl">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: hipertensão, amoxicilina, PAC..."
              className="w-full pl-11 pr-10 py-3 border border-zinc-300 rounded-2xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#1a6aad] focus:border-transparent bg-[#f8fafc]"
            />
            {query && (
              <button onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                aria-label="Limpar busca">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {categorias.map((cat) => (
              <button key={cat} onClick={() => setCatAtiva(cat)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                  catAtiva === cat ? "bg-[#0f2d4a] text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* Results */}
        <main className="flex-1 p-6 sm:p-8">
          {resultados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <p className="font-bold text-zinc-500 mb-1">Nenhuma prescrição encontrada</p>
              <p className="text-sm text-zinc-400">Tente outra queixa ou diagnóstico.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-zinc-400 mb-4 font-medium">
                {resultados.length} resultado{resultados.length !== 1 ? "s" : ""}
                {query ? ` para "${query}"` : ""}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {resultados.map((p) => (
                  <button key={p.id}
                    onClick={() => setSelected(p)}
                    className="text-left bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md hover:border-[#3db8d4] transition-all group">
                    <span className="inline-block text-[10px] font-bold bg-[#e8f4fc] text-[#1a6aad] px-2.5 py-1 rounded-full uppercase tracking-wide mb-3">
                      {p.categoria}
                    </span>
                    <h3 className="font-bold text-[#0f2d4a] text-sm leading-snug group-hover:text-[#1a6aad] transition-colors">
                      {p.titulo}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {p.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
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
