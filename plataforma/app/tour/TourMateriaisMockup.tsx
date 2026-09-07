"use client";
import { useState } from "react";
import { EBOOKS, AULAS_TEMAS } from "@/lib/materiais-data";

const TOTAL_AULAS = AULAS_TEMAS.reduce((s, t) => s + t.aulas.length, 0);

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
          Aulas ({TOTAL_AULAS})
        </button>
      </div>

      {tab === "ebook" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {EBOOKS.map((eb) => (
            <div key={eb.id} className="bg-white rounded-2xl border border-zinc-200 shadow-md overflow-hidden flex flex-col">
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
                <p className="text-[11px] text-zinc-400">{eb.paginas} · {eb.formato}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "aulas" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {AULAS_TEMAS.map((tema) => (
            <div key={tema.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
              <div className="h-28 bg-[#0a1220] flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tema.logo}
                  alt={tema.nome}
                  className="max-h-full max-w-full object-contain p-3"
                />
              </div>
              <div className="p-3 flex flex-col gap-1">
                <p className="text-xs font-bold text-[#0f2d4a] leading-snug">{tema.nome}</p>
                <p className="text-[11px] text-zinc-400">{tema.aulas.length} aula{tema.aulas.length !== 1 ? "s" : ""} · PDF</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
