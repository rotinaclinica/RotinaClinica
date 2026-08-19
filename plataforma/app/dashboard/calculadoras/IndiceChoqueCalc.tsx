"use client";

import { useState } from "react";
import { calcularIndiceChoque, type IndiceChoqueResult } from "@/lib/calculadoras/indice-choque";

const COR: Record<IndiceChoqueResult["cor"], { badge: string; bar: string }> = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500" },
  amarelo:  { badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",       bar: "bg-amber-500" },
  laranja:  { badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",   bar: "bg-orange-500" },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",               bar: "bg-red-500" },
};

export default function IndiceChoqueCalc() {
  const [fc, setFc] = useState("");
  const [pas, setPas] = useState("");
  const [resultado, setResultado] = useState<IndiceChoqueResult | null>(null);
  const [erro, setErro] = useState("");

  function calcular() {
    const fcNum = Number(fc);
    const pasNum = Number(pas);
    if (!fcNum || !pasNum || fcNum <= 0 || pasNum <= 0) {
      setErro("Preencha FC e PAS com valores válidos.");
      setResultado(null);
      return;
    }
    setErro("");
    setResultado(calcularIndiceChoque({ fc: fcNum, pas: pasNum }));
  }

  const cor = resultado ? COR[resultado.cor] : null;
  const barWidth = resultado ? Math.min(100, Math.round((resultado.indice / 2) * 100)) : 0;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] overflow-hidden shrink-0">
          <img src="/images/calculadoras/sepsis.png" alt="choque" className="w-full h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">Índice de Choque</p>
          <p className="text-xs text-zinc-400 dark:text-[#5a7a8e]">Triagem rápida de instabilidade hemodinâmica</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <p className="text-[11px] font-bold text-zinc-400 dark:text-[#5a7a8e] uppercase tracking-widest">
          Índice de Choque = FC ÷ PAS
        </p>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-[#8aacbc] mb-1.5">FC (bpm)</label>
            <input
              type="number" min="0" max="300" value={fc}
              onChange={(e) => { setFc(e.target.value); setResultado(null); }}
              placeholder="Ex: 110"
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-white/8 bg-zinc-50 dark:bg-[#1a2d45] text-sm text-[#0f2d4a] dark:text-[#e8edf5] placeholder-zinc-400 dark:placeholder-[#3a5a70] focus:outline-none focus:border-[#3db8d4]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-[#8aacbc] mb-1.5">PAS (mmHg)</label>
            <input
              type="number" min="0" max="300" value={pas}
              onChange={(e) => { setPas(e.target.value); setResultado(null); }}
              placeholder="Ex: 80"
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-white/8 bg-zinc-50 dark:bg-[#1a2d45] text-sm text-[#0f2d4a] dark:text-[#e8edf5] placeholder-zinc-400 dark:placeholder-[#3a5a70] focus:outline-none focus:border-[#3db8d4]"
            />
          </div>
        </div>

        {erro && <p className="text-xs text-red-500">{erro}</p>}

        <button onClick={calcular}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] text-white font-bold text-sm transition-colors">
          Calcular Índice de Choque
        </button>

        {resultado && cor && (
          <div className="rounded-xl border border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30] p-4 space-y-3">
            <div className="flex items-end gap-2">
              <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">
                {resultado.indice.toFixed(2)}
              </p>
              <p className="text-sm text-zinc-400 dark:text-[#5a7a8e] mb-0.5">IC</p>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-[#1a2d45] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${cor.bar}`} style={{ width: `${barWidth}%` }} />
            </div>
            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${cor.badge}`}>{resultado.label}</span>
            <p className="text-xs text-zinc-600 dark:text-[#8aacbc] leading-relaxed border-t border-zinc-100 dark:border-white/8 pt-3">
              {resultado.conduta}
            </p>
            <div className="text-[11px] text-zinc-400 dark:text-[#3a5a70] space-y-0.5 border-t border-zinc-100 dark:border-white/8 pt-3">
              <p><span className="font-semibold">0,5 – 0,7</span> — Normal (faixa aceita)</p>
              <p><span className="font-semibold">0,7 – 0,9</span> — Atenção (borderline)</p>
              <p><span className="font-semibold">0,9 – 1,0</span> — Elevado (risco aumentado)</p>
              <p><span className="font-semibold">≥ 1,0</span> — Instabilidade hemodinâmica</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
