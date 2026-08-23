"use client";
import { useState } from "react";

const SEQUENCIAS = [
  { titulo: "Dicas no Plantão", slides: 10, thumb: "/imagens%20dicas%20plant%C3%A3o/1.png" },
  { titulo: "TV Instável", slides: 12, thumb: "/imagens%20tv%20inst%C3%A1vel/1.png" },
  { titulo: "Infecções de Pele e Partes Moles", slides: 15, thumb: "/imagens%20infec%C3%A7%C3%B5es%20de%20pele%20e%20partes%20moles/1.png" },
  { titulo: "Infecção Fúngica", slides: 9, thumb: "/imagem%20infec%C3%A7%C3%A3o%20f%C3%BAngica/1.png" },
  { titulo: "Piúria no Idoso", slides: 10, thumb: "/imagens%20piuria%20idoso/1.png" },
  { titulo: "Hemorroida Interna", slides: 8, thumb: "/imagens%20hemorroida%20interna/1.png" },
];

const VIDEOS = [
  { titulo: "Pneumonia adquirida na comunidade (PAC)", thumb: "/tour-thumbnails/yt-pac.jpg" },
  { titulo: "Hipotireoidismo", thumb: "/tour-thumbnails/yt-hipotireoidismo.jpg" },
];

export default function TourCasosMockup() {
  const [tab, setTab] = useState<"imagem" | "video">("imagem");

  return (
    <div className="bg-[#0d1b2a] rounded-2xl shadow-xl overflow-hidden">
      {/* Tab switcher */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-1 bg-white/8 rounded-xl p-1 w-fit mb-4">
          <button
            onClick={() => setTab("imagem")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === "imagem"
                ? "bg-white text-[#0f2d4a] shadow-sm"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Imagem
          </button>
          <button
            onClick={() => setTab("video")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === "video"
                ? "bg-white text-[#0f2d4a] shadow-sm"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Vídeo
          </button>
        </div>

        {tab === "imagem" && (
          <div className="grid grid-cols-2 gap-3">
            {SEQUENCIAS.slice(0, 4).map((c) => (
              <div key={c.titulo} className="relative rounded-xl overflow-hidden bg-[#1a2d45]" style={{ aspectRatio: "16/9" }}>
                <img
                  src={c.thumb}
                  alt={c.titulo}
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="text-white text-[11px] font-bold leading-snug">{c.titulo}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "video" && (
          <div className="space-y-2">
            {VIDEOS.map((v) => (
              <div key={v.titulo} className="relative rounded-xl overflow-hidden bg-[#1a2d45]">
                <img
                  src={v.thumb}
                  alt={v.titulo}
                  className="w-full object-cover opacity-80"
                  style={{ aspectRatio: "16/9" }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#0f2d4a"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                  <p className="text-white text-[10px] font-semibold">{v.titulo}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
