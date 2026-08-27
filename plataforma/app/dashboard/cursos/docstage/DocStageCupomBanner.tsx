"use client";
import { useState } from "react";

export default function DocStageCupomBanner() {
  const [copiado, setCopiado] = useState(false);

  function handleCupomClick(e: React.MouseEvent) {
    e.preventDefault();
    navigator.clipboard.writeText("ROTINACLINICA").catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
    window.open("https://docstage.com.br", "_blank", "noopener,noreferrer");
  }

  return (
    <div className="max-w-2xl mb-6 rounded-2xl bg-gradient-to-br from-[#0f2d4a] to-[#1a4a7a] border border-[#3db8d4]/30 overflow-hidden">
      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-11 h-11 rounded-xl bg-[#3db8d4]/20 border border-[#3db8d4]/40 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3db8d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-extrabold text-sm leading-tight">Utilize nosso cupom e ganhe 50% de desconto na 1ª mensalidade</p>
            {copiado && (
              <p className="text-[#3db8d4] text-xs font-semibold mt-0.5">✓ Cupom copiado!</p>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:flex-shrink-0">
          <button
            onClick={handleCupomClick}
            className="flex items-center gap-2 bg-white/10 border border-[#3db8d4]/50 rounded-lg px-4 py-2 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <span className="text-[#9ec4de] text-xs font-semibold uppercase tracking-wide">Cupom:</span>
            <span className="font-mono font-extrabold text-[#3db8d4] tracking-widest text-sm">ROTINACLINICA</span>
          </button>
          <div className="flex items-center gap-2">
            <a
              href="https://docstage.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#3db8d4] hover:bg-[#2fa8c4] text-[#0f2d4a] font-bold text-xs px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Site oficial
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
            <a
              href="https://www.instagram.com/docstage/"
              target="_blank"
              rel="noopener noreferrer"
              title="@docstage no Instagram"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-opacity hover:opacity-90 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #833AB4, #FD1D1D, #FCAF45)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              <span className="text-white font-bold text-xs">Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
