"use client";

import { useState } from "react";

const photos = [
  { src: "/images/turma.jpg", alt: "Turma" },
  { src: "/images/turma%201.jpg", alt: "Turma 1" },
  { src: "/images/turma%202.jpg", alt: "Turma 2" },
  { src: "/images/turma%203.jpg", alt: "Turma 3" },
  { src: "/images/turma%204.jpg", alt: "Turma 4" },
  { src: "/images/turma%204.1.jpg", alt: "Turma" },
];

export default function TurmaCarousel() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((i) => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setCurrent((i) => (i === photos.length - 1 ? 0 : i + 1));

  return (
    <div className="rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
      <div className="relative">
        <img
          key={current}
          src={photos[current].src}
          alt={photos[current].alt}
          className="w-full h-[500px] object-cover object-center"
        />

        <button
          onClick={prev}
          aria-label="Foto anterior"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          onClick={next}
          aria-label="Próxima foto"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Ir para foto ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white px-5 py-3 text-center">
        <p className="text-xs text-zinc-400 font-medium tracking-wide uppercase">
          Nossas turmas · {current + 1} / {photos.length}
        </p>
      </div>
    </div>
  );
}
