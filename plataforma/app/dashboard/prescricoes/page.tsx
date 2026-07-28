"use client";

import { useState, useMemo } from "react";

export const metadata = undefined;

// Dados virão do banco — por enquanto estrutura de exemplo
const prescricoes: { id: string; titulo: string; categoria: string; tags: string[] }[] = [
  // Exemplos para demonstrar o buscador — substituir pelo conteúdo real
  { id: "1", titulo: "HAS em crise hipertensiva", categoria: "Cardiologia", tags: ["hipertensão", "PA", "anti-hipertensivo"] },
  { id: "2", titulo: "Fibrilação atrial — controle de frequência", categoria: "Cardiologia", tags: ["FA", "beta-bloqueador", "digoxina"] },
  { id: "3", titulo: "Pneumonia adquirida na comunidade", categoria: "Pneumologia", tags: ["PAC", "antibiótico", "amoxicilina"] },
  { id: "4", titulo: "DPOC exacerbado", categoria: "Pneumologia", tags: ["DPOC", "broncoespasmo", "corticoide"] },
  { id: "5", titulo: "ITU não complicada", categoria: "Infectologia", tags: ["ITU", "antibiótico", "nitrofurantoína"] },
  { id: "6", titulo: "Cetoacidose diabética", categoria: "Endocrinologia", tags: ["CAD", "insulina", "hidratação"] },
  { id: "7", titulo: "Hipoglicemia", categoria: "Endocrinologia", tags: ["glicose", "glucagon", "diabetes"] },
  { id: "8", titulo: "Dor abdominal aguda — avaliação inicial", categoria: "Cirurgia", tags: ["abdome", "analgesia", "dipirona"] },
  { id: "9", titulo: "Crise epiléptica", categoria: "Neurologia", tags: ["epilepsia", "benzodiazepínico", "diazepam"] },
  { id: "10", titulo: "AVC isquêmico — protocolo de chegada", categoria: "Neurologia", tags: ["AVC", "trombolítico", "NIHSS"] },
];

const categorias = ["Todos", ...Array.from(new Set(prescricoes.map((p) => p.categoria)))];

export default function PrescricoesPage() {
  const [query, setQuery] = useState("");
  const [catAtiva, setCatAtiva] = useState("Todos");

  const resultados = useMemo(() => {
    const q = query.toLowerCase().trim();
    return prescricoes.filter((p) => {
      const matchCat = catAtiva === "Todos" || p.categoria === catAtiva;
      if (!q) return matchCat;
      const matchQ =
        p.titulo.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [query, catAtiva]);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 sm:px-8 py-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] mb-1">Prescrições</h1>
        <p className="text-zinc-500 text-sm">Busque por queixa, diagnóstico ou medicamento.</p>

        {/* Buscador */}
        <div className="relative mt-4 max-w-xl">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: hipertensão, amoxicilina, PAC..."
            className="w-full pl-11 pr-4 py-3 border border-zinc-300 rounded-2xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#1a6aad] focus:border-transparent bg-[#f8fafc]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              aria-label="Limpar busca"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Filtro por categoria */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatAtiva(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                catAtiva === cat
                  ? "bg-[#0f2d4a] text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Resultados */}
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
                <button
                  key={p.id}
                  className="text-left bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md hover:border-[#3db8d4] transition-all group"
                  onClick={() => {/* abrir modal/página da prescrição */}}
                >
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
  );
}
