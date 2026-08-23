"use client";
import { useState } from "react";

export default function CupomBanner() {
  const [copiado, setCopiado] = useState(false);

  function handleClick() {
    navigator.clipboard.writeText("ROTINACLINICARF").catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  return (
    <a
      href="http://safetechmedical.com.br"
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="block max-w-2xl mb-6 rounded-2xl bg-gradient-to-br from-[#0f2d4a] to-[#1a4a7a] border border-[#3db8d4]/30 overflow-hidden hover:border-[#3db8d4]/60 transition-colors"
    >
      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-11 h-11 rounded-xl bg-[#3db8d4]/20 border border-[#3db8d4]/40 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3db8d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-extrabold text-sm leading-tight">Utilize nosso cupom e garanta seu desconto exclusivo</p>
            {copiado && (
              <p className="text-[#3db8d4] text-xs font-semibold mt-0.5">✓ Cupom copiado!</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 border border-[#3db8d4]/50 rounded-lg px-4 py-2 sm:flex-shrink-0">
          <span className="text-[#9ec4de] text-xs font-semibold uppercase tracking-wide">Cupom:</span>
          <span className="font-mono font-extrabold text-[#3db8d4] tracking-widest text-sm">ROTINACLINICARF</span>
        </div>
      </div>
    </a>
  );
}
