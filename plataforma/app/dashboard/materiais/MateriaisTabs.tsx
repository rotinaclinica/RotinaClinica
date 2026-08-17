"use client";

import { useState } from "react";
import DownloadButton from "./DownloadButton";

const EBOOKS = [
  {
    id: "guia-prescricoes",
    titulo: "Manual prático de prescrições: da UBS à emergência",
    descricao:
      "Prescrições práticas e condutas clínicas organizadas por tema, com doses, diluições e orientações para o dia a dia no plantão.",
    paginas: "500 páginas",
    formato: "PDF",
    capa: "/images/ebook-manual-transparent.png",
  },
  {
    id: "guia-intubacao",
    titulo: "Guia de intubação orotraqueal, sedação e ventilação mecânica",
    descricao:
      "Abordagem prática e baseada em evidências para intubação orotraqueal, sedação e ventilação mecânica no paciente adulto em situações de urgência.",
    paginas: "Guia prático",
    formato: "PDF",
    capa: "/images/ebook-iot.png",
  },
];

type Tab = "ebooks" | "aulas";

export default function MateriaisTabs({ email }: { email: string }) {
  const [tab, setTab] = useState<Tab>("ebooks");

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-100 dark:bg-white/6 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("ebooks")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "ebooks"
              ? "bg-white dark:bg-[#1a2d45] text-[#0f2d4a] dark:text-[#e8edf5] shadow-sm"
              : "text-zinc-500 dark:text-[#6a8fa5] hover:text-zinc-700 dark:hover:text-[#9ec4de]"
          }`}
        >
          Ebooks
        </button>
        <button
          onClick={() => setTab("aulas")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "aulas"
              ? "bg-white dark:bg-[#1a2d45] text-[#0f2d4a] dark:text-[#e8edf5] shadow-sm"
              : "text-zinc-500 dark:text-[#6a8fa5] hover:text-zinc-700 dark:hover:text-[#9ec4de]"
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
                  <p className="text-xs text-zinc-500 dark:text-[#6a8fa5] leading-relaxed">
                    {ebook.descricao}
                  </p>
                </div>

                <div className="flex gap-3 text-[11px] text-zinc-400 dark:text-[#5a7a8e]">
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

      {tab === "aulas" && (
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-[#1a2535] rounded-2xl flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <p className="font-bold text-zinc-500 dark:text-[#7d96ad] mb-1">Em breve</p>
          <p className="text-sm text-zinc-400 dark:text-[#5a7a8e]">
            As videoaulas estarão disponíveis aqui em breve.
          </p>
        </div>
      )}
    </>
  );
}
