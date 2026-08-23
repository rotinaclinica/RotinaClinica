"use client";
import { useState } from "react";

const SEQUENCIAS = [
  { titulo: "Dicas no Plantão", images: 10, thumb: "/imagens%20dicas%20plant%C3%A3o/1.png" },
  { titulo: "TV Instável", images: 12, thumb: "/imagens%20tv%20inst%C3%A1vel/1.png" },
  { titulo: "Infecções de Pele e Partes Moles", images: 15, thumb: "/imagens%20infec%C3%A7%C3%B5es%20de%20pele%20e%20partes%20moles/1.png" },
  { titulo: "Infecção Fúngica", images: 9, thumb: "/imagem%20infec%C3%A7%C3%A3o%20f%C3%BAngica/1.png" },
  { titulo: "Piúria no Idoso", images: 10, thumb: "/imagens%20piuria%20idoso/1.png" },
  { titulo: "Hemorroida Interna", images: 8, thumb: "/imagens%20hemorroida%20interna/1.png" },
];

const VIDEOS = [
  { id: "5t4vXXZICXg", titulo: "Pneumonia adquirida na comunidade (PAC)" },
  { id: "CmWVOHlO2Ww", titulo: "Hipotireoidismo" },
  { id: "HYdR18O_QF8", titulo: "Uso de insulina" },
  { id: "QMDZdkN_uyw", titulo: "Nódulo tireoidiano" },
];

export default function TourCasosMockup() {
  const [tab, setTab] = useState<"imagem" | "video">("imagem");

  return (
    <div>
      {/* Tab switcher — mesmo estilo da página real */}
      <div className="flex gap-1 mb-6 bg-zinc-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("imagem")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "imagem"
              ? "bg-white text-[#0f2d4a] shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Imagem
        </button>
        <button
          onClick={() => setTab("video")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "video"
              ? "bg-white text-[#0f2d4a] shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Vídeo
        </button>
      </div>

      {/* Galeria — mesmo estilo da página real */}
      {tab === "imagem" && (
        <div>
          <p className="text-sm text-zinc-500 mb-4">Clique para abrir a sequência.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {SEQUENCIAS.map((s) => (
              <div
                key={s.titulo}
                className="group relative rounded-2xl overflow-hidden border border-zinc-200 shadow-sm text-left bg-white"
              >
                <div className="relative">
                  <img
                    src={s.thumb}
                    alt={s.titulo}
                    className="w-full object-cover aspect-square bg-[#0f1c2e]"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </svg>
                  </div>
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-[#0f2d4a] text-xs font-bold leading-snug">{s.titulo}</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">{s.images} imagens</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "video" && (
        <div>
          <p className="text-sm text-zinc-500 mb-4">Clique no card para assistir.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VIDEOS.map((v) => (
              <div key={v.id} className="rounded-2xl overflow-hidden border border-zinc-200 shadow-sm bg-white text-left w-full">
                <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                  <img
                    src={`https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`}
                    alt={v.titulo}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-[#0f2d4a] ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm font-semibold text-[#0f2d4a] leading-snug">{v.titulo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
