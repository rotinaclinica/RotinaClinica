"use client";

import { useState } from "react";
import DownloadButton from "./DownloadButton";
const AULAS_MATERIAIS = [
  {
    id: "constipacao-intestinal",
    titulo: "Abordagem da Constipação Intestinal",
    descricao: "Material de apoio com abordagem prática e baseada em evidências para o manejo da constipação intestinal.",
    tamanho: "2,3 MB",
  },
  {
    id: "nauseas-vomitos",
    titulo: "Abordagem de Náuseas e Vômitos",
    descricao: "Material de apoio com abordagem sistematizada para avaliar e tratar náuseas e vômitos no plantão.",
    tamanho: "2,9 MB",
  },
  {
    id: "dor-analgesia",
    titulo: "Dor e Analgesia",
    descricao: "Material de apoio com estratégias práticas de avaliação e manejo da dor no paciente adulto.",
    tamanho: "3,0 MB",
  },
  {
    id: "dengue",
    titulo: "Dengue",
    descricao: "Abordagem prática da dengue no plantão: classificação de risco, sinais de alarme e manejo clínico.",
    tamanho: "1,4 MB",
  },
  {
    id: "drge",
    titulo: "DRGE e suas complicações — o essencial para o generalista",
    descricao: "Diagnóstico e tratamento da doença do refluxo gastroesofágico e suas principais complicações.",
    tamanho: "4,4 MB",
  },
  {
    id: "disturbios-potassio",
    titulo: "Distúrbios do Potássio",
    descricao: "Abordagem sistemática da hipocalemia e hipercalemia: causas, diagnóstico e conduta clínica.",
    tamanho: "1,0 MB",
  },
  {
    id: "disturbios-sodio",
    titulo: "Distúrbios do Sódio",
    descricao: "Manejo prático da hiponatremia e hipernatremia, com critérios de correção e cuidados essenciais.",
    tamanho: "10,6 MB",
  },
  {
    id: "prescricao-racional",
    titulo: "Prescrição Racional",
    descricao: "Princípios e estratégias de prescrição racional de medicamentos para a prática clínica diária.",
    tamanho: "6,3 MB",
  },
];

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
              : "text-[#0f2d4a] dark:text-[#6a8fa5] hover:text-[#0f2d4a] dark:hover:text-[#9ec4de]"
          }`}
        >
          Ebooks
        </button>
        <button
          onClick={() => setTab("aulas")}
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

      {tab === "aulas" && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
          {AULAS_MATERIAIS.map((mat) => (
            <div
              key={mat.id}
              className="bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-2xl overflow-hidden flex flex-col"
            >
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
                    {mat.titulo}
                  </h2>
                  <p className="text-xs text-[#0f2d4a] dark:text-[#6a8fa5] leading-relaxed">
                    {mat.descricao}
                  </p>
                </div>

                <div className="flex gap-3 text-[11px] text-[#0f2d4a] dark:text-[#5a7a8e]">
                  <span>{mat.tamanho}</span>
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

                <DownloadButton
                  ebookId={mat.id}
                  filename={`${mat.titulo}.pdf`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
