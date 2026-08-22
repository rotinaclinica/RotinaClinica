"use client";

import { useState } from "react";
import EvolucaoContent from "@/app/dashboard/evolucoes/EvolucaoContent";

interface Props {
  titulo: string;
  conteudo: string;
  children: React.ReactNode;
}

export default function TourEvolucaoModal({ titulo, conteudo, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="w-full text-left cursor-pointer">
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-12 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mb-12"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <span className="text-[10px] font-bold text-[#3db8d4] uppercase tracking-widest">Modelo de Evolução</span>
                <h2 className="text-lg font-extrabold text-[#0f2d4a] leading-tight">{titulo}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 transition-colors flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Content — data-theme="light" prevents dark: variants from applying */}
            <div data-theme="light" className="px-6 py-5 max-h-[70vh] overflow-y-auto">
              <EvolucaoContent conteudo={conteudo} />
            </div>

            {/* Footer CTA */}
            <div className="px-6 py-4 border-t border-zinc-100 bg-[#f8fafc] rounded-b-2xl text-center">
              <p className="text-xs text-zinc-500 mb-2">
                Acesse todos os modelos de evolução com a assinatura Rotina Clínica
              </p>
              <a
                href="/assinatura"
                className="inline-flex items-center gap-1.5 bg-[#1a6aad] hover:bg-[#0f2d4a] text-white text-xs font-bold px-5 py-2 rounded-xl transition-all"
              >
                Assine agora
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
