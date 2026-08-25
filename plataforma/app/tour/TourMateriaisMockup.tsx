"use client";
import { useState } from "react";

const EBOOKS = [
  {
    titulo: "Manual prático de prescrições: da UBS à emergência",
    paginas: "500 páginas · PDF",
    capa: "/images/ebook-manual-transparent.png",
  },
  {
    titulo: "Guia de intubação orotraqueal, sedação e ventilação mecânica",
    paginas: "Guia prático · PDF",
    capa: "/images/ebook-iot.png",
  },
];

const AULAS = [
  { titulo: "Abordagem da Constipação Intestinal", tamanho: "2,3 MB" },
  { titulo: "Abordagem de Náuseas e Vômitos", tamanho: "2,9 MB" },
  { titulo: "Dor e Analgesia", tamanho: "3,0 MB" },
  { titulo: "Dengue", tamanho: "1,4 MB" },
  { titulo: "DRGE e suas complicações", tamanho: "4,4 MB" },
  { titulo: "Distúrbios do Potássio", tamanho: "1,0 MB" },
  { titulo: "Distúrbios do Sódio", tamanho: "10,6 MB" },
  { titulo: "Prescrição Racional", tamanho: "6,3 MB" },
];

export default function TourMateriaisMockup() {
  const [tab, setTab] = useState<"ebook" | "aulas">("ebook");

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-zinc-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("ebook")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "ebook"
              ? "bg-white text-[#0f2d4a] shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Ebooks ({EBOOKS.length})
        </button>
        <button
          onClick={() => setTab("aulas")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "aulas"
              ? "bg-white text-[#0f2d4a] shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Aulas ({AULAS.length})
        </button>
      </div>

      {tab === "ebook" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {EBOOKS.map((eb) => (
            <div key={eb.titulo} className="bg-white rounded-2xl border border-zinc-200 shadow-md overflow-hidden flex flex-col">
              <div
                className="h-52"
                style={{
                  backgroundImage: `url('${eb.capa}')`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: "#0a1220",
                }}
              />
              <div className="p-4 flex flex-col gap-1">
                <p className="text-xs font-bold text-[#0f2d4a] leading-snug">{eb.titulo}</p>
                <p className="text-[11px] text-zinc-400">{eb.paginas}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "aulas" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {AULAS.map((mat) => (
            <div key={mat.titulo} className="bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
              <div className="h-28 bg-[#0a1220] flex items-center justify-center">
                <div className="w-12 h-12 bg-[#1a2d45] rounded-xl flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3db8d4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
              </div>
              <div className="p-3 flex flex-col gap-1">
                <p className="text-xs font-bold text-[#0f2d4a] leading-snug">{mat.titulo}</p>
                <p className="text-[11px] text-zinc-400">PDF · {mat.tamanho}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
