"use client";
// v2
import { useState, useEffect } from "react";

// ── Adicione novas sequências aqui ──────────────────────────────────
const SEQUENCIAS = [
  {
    titulo: "Dicas no Plantão",
    images: Array.from({ length: 10 }, (_, i) => ({
      src: `/imagens%20dicas%20plant%C3%A3o/${i + 1}.png`,
      alt: `Dica no plantão ${i + 1}`,
    })),
  },
  {
    titulo: "TV Instável",
    images: Array.from({ length: 12 }, (_, i) => ({
      src: `/imagens%20tv%20inst%C3%A1vel/${i + 1}.png`,
      alt: `TV instável ${i + 1}`,
    })),
  },
  {
    titulo: "Infecções de Pele e Partes Moles",
    images: Array.from({ length: 15 }, (_, i) => ({
      src: `/imagens%20infec%C3%A7%C3%B5es%20de%20pele%20e%20partes%20moles/${i + 1}.png`,
      alt: `Infecções de pele e partes moles ${i + 1}`,
    })),
  },
  {
    titulo: "Infecção Fúngica",
    images: Array.from({ length: 9 }, (_, i) => ({
      src: `/imagem%20infec%C3%A7%C3%A3o%20f%C3%BAngica/${i + 1}.png`,
      alt: `Infecção fúngica ${i + 1}`,
    })),
  },
  {
    titulo: "Piúria no Idoso",
    images: Array.from({ length: 10 }, (_, i) => ({
      src: `/imagens%20piuria%20idoso/${i + 1}.png`,
      alt: `Piúria no idoso ${i + 1}`,
    })),
  },
  {
    titulo: "Hemorroida Interna",
    images: Array.from({ length: 8 }, (_, i) => ({
      src: `/imagens%20hemorroida%20interna/${i + 1}.png`,
      alt: `Hemorroida interna ${i + 1}`,
    })),
  },
];

const VIDEOS = [
  { id: "5t4vXXZICXg", titulo: "Pneumonia adquirida na comunidade (PAC)" },
  { id: "CmWVOHlO2Ww", titulo: "Hipotireoidismo" },
  { id: "HYdR18O_QF8", titulo: "Uso de insulina" },
  { id: "QMDZdkN_uyw", titulo: "Nódulo tireoidiano" },
];

export default function CasosContent() {
  // carrossel aberto: { seqIndex, imgIndex } | null
  const [tab, setTab] = useState<"imagem" | "video">("imagem");
  const [carousel, setCarousel] = useState<{ seq: number; img: number } | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const openSeq = (seqIdx: number) => setCarousel({ seq: seqIdx, img: 0 });

  const images = carousel !== null ? SEQUENCIAS[carousel.seq].images : [];

  const prevImg = () => setCarousel((c) => c && ({ ...c, img: c.img === 0 ? images.length - 1 : c.img - 1 }));
  const nextImg = () => setCarousel((c) => c && ({ ...c, img: c.img === images.length - 1 ? 0 : c.img + 1 }));

  useEffect(() => {
    if (carousel === null && activeVideo === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setCarousel(null); setActiveVideo(null); }
      if (carousel !== null) {
        if (e.key === "ArrowLeft") prevImg();
        if (e.key === "ArrowRight") nextImg();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [carousel, activeVideo]);

  return (
    <main className="flex-1 p-6 sm:p-8">

      {/* ── Abas ── */}
      <div className="flex gap-1 mb-6 bg-zinc-100 dark:bg-white/6 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("imagem")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "imagem"
              ? "bg-white dark:bg-[#1a2d45] text-[#0f2d4a] dark:text-[#e8edf5] shadow-sm"
              : "text-[#0f2d4a] dark:text-[#6a8fa5] hover:text-zinc-700 dark:hover:text-[#9ec4de]"
          }`}
        >
          Imagem
        </button>
        <button
          onClick={() => setTab("video")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === "video"
              ? "bg-white dark:bg-[#1a2d45] text-[#0f2d4a] dark:text-[#e8edf5] shadow-sm"
              : "text-[#0f2d4a] dark:text-[#6a8fa5] hover:text-zinc-700 dark:hover:text-[#9ec4de]"
          }`}
        >
          Vídeo
        </button>
      </div>

      {/* ── Galeria ── */}
      {tab === "imagem" && (
        <div>
          <p className="text-sm text-[#0f2d4a] dark:text-[#6a8fa5] mb-4">Clique para abrir a sequência.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {SEQUENCIAS.map((s, i) => (
              <button
                key={i}
                onClick={() => openSeq(i)}
                className="group relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-sm text-left bg-white dark:bg-[#131c2e]"
              >
                <div className="relative">
                  <img
                    src={s.images[0].src}
                    alt={s.titulo}
                    className="w-full object-cover aspect-square bg-[#0f1c2e]"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/20 group-hover:bg-white/40 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </svg>
                  </div>
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-[#0f2d4a] dark:text-[#e8edf5] text-xs font-bold leading-snug">{s.titulo}</p>
                  <p className="text-[#0f2d4a] dark:text-[#5a7a8e] text-[11px] mt-0.5">{s.images.length} imagens</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Vídeos ── */}
      {tab === "video" && (
        <div>
          <p className="text-sm text-[#0f2d4a] dark:text-[#6a8fa5] mb-4">Clique no card para assistir.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VIDEOS.map((v) => (
              <button key={v.id} onClick={() => setActiveVideo(v.id)} className="group rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#131c2e] text-left w-full">
                <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                  <img
                    src={`https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`}
                    alt={v.titulo}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-[#0f2d4a] ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm font-semibold text-[#0f2d4a] dark:text-[#e8edf5] leading-snug">{v.titulo}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Lightbox Vídeo ── */}
      {activeVideo !== null && (
        <div className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4" onClick={() => setActiveVideo(null)}>
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full rounded-xl overflow-hidden shadow-2xl" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo}?autoplay=1&rel=0`}
                title="Vídeo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
          <button onClick={() => setActiveVideo(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── Lightbox Carrossel ── */}
      {carousel !== null && (
        <div className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4" onClick={() => setCarousel(null)}>
          <button onClick={(e) => { e.stopPropagation(); prevImg(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors z-10">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          <img
            src={images[carousel.img].src}
            alt={images[carousel.img].alt}
            className="max-w-full max-h-[88vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button onClick={(e) => { e.stopPropagation(); nextImg(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors z-10">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          {/* Título da sequência */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
            {SEQUENCIAS[carousel.seq].titulo}
          </div>

          {/* Contador */}
          <div className="absolute bottom-12 right-4 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
            {carousel.img + 1} / {images.length}
          </div>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setCarousel((c) => c && ({ ...c, img: i })); }}
                className={`w-2 h-2 rounded-full transition-all ${i === carousel.img ? "bg-white scale-125" : "bg-white/40 hover:bg-white/70"}`}
              />
            ))}
          </div>

          <button onClick={() => setCarousel(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}
    </main>
  );
}
