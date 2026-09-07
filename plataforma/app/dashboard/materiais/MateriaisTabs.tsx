"use client";

import { useState } from "react";
import DownloadButton from "./DownloadButton";
import { AULAS_TEMAS, AULAS_MATERIAIS, EBOOKS, type Aula } from "@/lib/materiais-data";

type Tab = "ebooks" | "aulas";

function AulaCard({ aula, email }: { aula: Aula; email: string }) {
  return (
    <div className="bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-2xl overflow-hidden flex flex-col">
      {/* Ícone */}
      <div className="h-40 bg-[#0a1220] flex items-center justify-center rounded-t-2xl">
        <div className="w-16 h-16 bg-[#1a2d45] rounded-2xl flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3db8d4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <h2 className="font-bold text-[#0f2d4a] dark:text-[#d4dce8] text-sm leading-snug mb-1">
            {aula.titulo}
          </h2>
          <p className="text-xs text-[#0f2d4a] dark:text-[#6a8fa5] leading-relaxed">
            {aula.descricao}
          </p>
        </div>

        <div className="flex gap-3 text-[11px] text-[#0f2d4a] dark:text-[#5a7a8e]">
          <span>{aula.tamanho}</span>
          <span>·</span>
          <span>PDF</span>
        </div>

        <div className="flex items-start gap-2 bg-[#f0f7ff] dark:bg-[#0f1e30] rounded-xl px-3 py-2.5">
          <svg className="shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a6aad" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-[11px] text-[#1a6aad] dark:text-[#3db8d4] leading-relaxed">
            O arquivo será vinculado ao seu e-mail{email ? ` (${email})` : ""} em cada página.
          </p>
        </div>

        <DownloadButton ebookId={aula.id} filename={`${aula.titulo}.pdf`} />
      </div>
    </div>
  );
}

function TemaCard({ tema, onClick }: { tema: (typeof AULAS_TEMAS)[number]; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-2xl overflow-hidden flex flex-col hover:border-[#3db8d4] dark:hover:border-[#3db8d4] transition-colors group"
    >
      {/* Logo do tema */}
      <div className="h-40 bg-[#0a1220] flex items-center justify-center rounded-t-2xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tema.logo}
          alt={tema.nome}
          className="max-h-full max-w-full object-contain p-3 group-hover:scale-105 transition-transform"
        />
      </div>

      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-bold text-[#0f2d4a] dark:text-[#d4dce8] text-sm leading-snug">
              {tema.nome}
            </h2>
          </div>
          <p className="text-xs text-[#0f2d4a] dark:text-[#6a8fa5] leading-relaxed">
            {tema.descricao}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#1a6aad] dark:text-[#3db8d4] bg-[#f0f7ff] dark:bg-[#0f1e30] rounded-full px-2.5 py-1">
            {tema.aulas.length} aula{tema.aulas.length !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a6aad] dark:text-[#3db8d4] group-hover:gap-1.5 transition-all">
            Abrir
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </div>
      </div>
    </button>
  );
}

export default function MateriaisTabs({ email }: { email: string }) {
  const [tab, setTab] = useState<Tab>("ebooks");
  const [temaAberto, setTemaAberto] = useState<string | null>(null);

  const temaSelecionado = AULAS_TEMAS.find((t) => t.id === temaAberto) ?? null;

  function switchTab(t: Tab) {
    setTab(t);
    setTemaAberto(null); // volta ao topo ao trocar de aba
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-100 dark:bg-white/6 rounded-xl p-1 w-fit">
        <button
          onClick={() => switchTab("ebooks")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "ebooks"
              ? "bg-white dark:bg-[#1a2d45] text-[#0f2d4a] dark:text-[#e8edf5] shadow-sm"
              : "text-[#0f2d4a] dark:text-[#6a8fa5] hover:text-[#0f2d4a] dark:hover:text-[#9ec4de]"
          }`}
        >
          Ebooks
        </button>
        <button
          onClick={() => switchTab("aulas")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "aulas"
              ? "bg-white dark:bg-[#1a2d45] text-[#0f2d4a] dark:text-[#e8edf5] shadow-sm"
              : "text-[#0f2d4a] dark:text-[#6a8fa5] hover:text-[#0f2d4a] dark:hover:text-[#9ec4de]"
          }`}
        >
          Aulas
        </button>
      </div>

      {tab === "ebooks" && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
          {EBOOKS.map((ebook) => (
            <div
              key={ebook.id}
              className="bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-2xl overflow-hidden flex flex-col"
            >
              {/* Cover */}
              <div
                className="rounded-t-2xl h-64"
                style={{
                  backgroundImage: `url('${ebook.capa}')`,
                  backgroundSize: "contain",
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: "#0a1220",
                }}
              />

              {/* Info */}
              <div className="p-5 flex flex-col flex-1 gap-3">
                <div>
                  <h2 className="font-bold text-[#0f2d4a] dark:text-[#d4dce8] text-sm leading-snug mb-1">
                    {ebook.titulo}
                  </h2>
                  <p className="text-xs text-[#0f2d4a] dark:text-[#6a8fa5] leading-relaxed">
                    {ebook.descricao}
                  </p>
                </div>

                <div className="flex gap-3 text-[11px] text-[#0f2d4a] dark:text-[#5a7a8e]">
                  <span>{ebook.paginas}</span>
                  <span>·</span>
                  <span>{ebook.formato}</span>
                </div>

                <div className="flex items-start gap-2 bg-[#f0f7ff] dark:bg-[#0f1e30] rounded-xl px-3 py-2.5">
                  <svg className="shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a6aad" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-[11px] text-[#1a6aad] dark:text-[#3db8d4] leading-relaxed">
                    O arquivo será vinculado ao seu e-mail{email ? ` (${email})` : ""} em cada página.
                  </p>
                </div>

                <DownloadButton
                  ebookId={ebook.id}
                  filename={`${ebook.titulo}.pdf`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "aulas" && !temaSelecionado && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
          {/* Temas (pastas) primeiro */}
          {AULAS_TEMAS.map((tema) => (
            <TemaCard key={tema.id} tema={tema} onClick={() => setTemaAberto(tema.id)} />
          ))}
          {/* Aulas avulsas */}
          {AULAS_MATERIAIS.map((aula) => (
            <AulaCard key={aula.id} aula={aula} email={email} />
          ))}
        </div>
      )}

      {tab === "aulas" && temaSelecionado && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => setTemaAberto(null)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a6aad] dark:text-[#3db8d4] hover:opacity-80 transition-opacity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Aulas
            </button>
            <span className="text-zinc-300 dark:text-white/20">/</span>
            <h2 className="text-sm font-bold text-[#0f2d4a] dark:text-[#e8edf5]">{temaSelecionado.nome}</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
            {temaSelecionado.aulas.map((aula) => (
              <AulaCard key={aula.id} aula={aula} email={email} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
