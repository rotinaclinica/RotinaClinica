"use client";

import { useState, useEffect, useCallback } from "react";

const IMAGES = Array.from({ length: 10 }, (_, i) => ({
  src: `/imagens%20dicas%20plant%C3%A3o/${i + 1}.png`,
  alt: `Dica no plantão ${i + 1}`,
}));

const VIDEOS = [
  { id: "5t4vXXZICXg", titulo: "Pneumonia adquirida na comunidade (PAC)" },
  { id: "CmWVOHlO2Ww", titulo: "Hipotireoidismo" },
];

export default function CasosContent() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const prev = useCallback(() =>
    setLightbox((i) => (i === null ? 0 : i === 0 ? IMAGES.length - 1 : i - 1)), []);
  const next = useCallback(() =>
    setLightbox((i) => (i === null ? 0 : i === IMAGES.length - 1 ? 0 : i + 1)), []);

  useEffect(() => {
    if (lightbox === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setLightbox(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, prev, next]);

  return (
    <main className="flex-1 p-6 sm:p-8 space-y-12">

      {/* ── Galeria ── */}
      <section>
        <div className="mb-5">
          <h2 className="text-lg font-extrabold text-[#0f2d4a] dark:text-[#e8edf5]">Dicas no Plantão</h2>
          <p className="text-sm text-zinc-500 dark:text-[#6a8fa5] mt-0.5">Clique em qualquer imagem para ampliar.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {IMAGES.map((img, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 hover:border-[#1a6aad] dark:hover:border-[#3db8d4] transition-all shadow-sm hover:shadow-md"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <svg className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                </svg>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Vídeos ── */}
      <section>
        <div className="mb-5">
          <h2 className="text-lg font-extrabold text-[#0f2d4a] dark:text-[#e8edf5]">Casos Clínicos em Vídeo</h2>
          <p className="text-sm text-zinc-500 dark:text-[#6a8fa5] mt-0.5">Clique no card para assistir.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {VIDEOS.map((v) => (
            <div key={v.id} className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#131c2e]">
              {activeVideo === v.id ? (
                <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
                    title={v.titulo}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setActiveVideo(v.id)}
                  className="group w-full text-left"
                >
                  <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                    <img
                      src={`https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`}
                      alt={v.titulo}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-[#0f2d4a] ml-1" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              )}
              <div className="px-4 py-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#0f2d4a] dark:text-[#e8edf5] leading-snug">{v.titulo}</p>
                {activeVideo === v.id && (
                  <button
                    onClick={() => setActiveVideo(null)}
                    className="flex-shrink-0 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    Fechar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors z-10"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <img
            src={IMAGES[lightbox].src}
            alt={IMAGES[lightbox].alt}
            className="max-w-full max-h-[88vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors z-10"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                className={`w-2 h-2 rounded-full transition-all ${i === lightbox ? "bg-white scale-125" : "bg-white/40 hover:bg-white/70"}`}
              />
            ))}
          </div>

          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}
    </main>
  );
}
