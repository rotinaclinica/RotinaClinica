"use client";

import { useState } from "react";
import {
  calcularChildPugh, type ChildPughInput, type ChildPughResult,
  BILIRRUBINA_CP, ALBUMINA_CP, INR_CP, ASCITE_CP, ENCEFALOPATIA_CP,
} from "@/lib/calculadoras/child-pugh";

const COR: Record<ChildPughResult["cor"], { badge: string; bar: string }> = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500" },
  amarelo:  { badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",   bar: "bg-yellow-500" },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",               bar: "bg-red-500" },
};

type TierKey = keyof ChildPughInput;
type TierOption = { valor: 1 | 2 | 3; label: string };

const SECOES: { key: TierKey; titulo: string; options: TierOption[] }[] = [
  { key: "bilirrubina",   titulo: "Bilirrubina total",       options: BILIRRUBINA_CP },
  { key: "albumina",      titulo: "Albumina",                 options: ALBUMINA_CP },
  { key: "inr",           titulo: "INR",                      options: INR_CP },
  { key: "ascite",        titulo: "Ascite",                   options: ASCITE_CP },
  { key: "encefalopatia", titulo: "Encefalopatia hepática",   options: ENCEFALOPATIA_CP },
];

const INITIAL: ChildPughInput = {
  bilirrubina: 1, albumina: 1, inr: 1, ascite: 1, encefalopatia: 1,
};

export default function ChildPughCalc() {
  const [tiers, setTiers] = useState<ChildPughInput>(INITIAL);
  const [resultado, setResultado] = useState<ChildPughResult | null>(null);

  function setTier(key: TierKey, val: 1 | 2 | 3) {
    setTiers((t) => ({ ...t, [key]: val }));
    setResultado(null);
  }

  function calcular() {
    setResultado(calcularChildPugh(tiers));
  }

  const cor = resultado ? COR[resultado.cor] : null;
  const barWidth = resultado ? Math.round(((resultado.total - 5) / 10) * 100) : 0;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] overflow-hidden shrink-0">
          <img src="/images/calculadoras/figado.png" alt="fígado" className="w-full h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">Child-Pugh</p>
          <p className="text-xs text-zinc-400 dark:text-[#5a7a8e]">Gravidade da cirrose hepática</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {SECOES.map((secao) => (
          <div key={secao.key}>
            <p className="text-[11px] font-bold text-zinc-400 dark:text-[#5a7a8e] uppercase tracking-widest mb-2">
              {secao.titulo}
            </p>
            <div className="flex flex-col gap-1.5">
              {secao.options.map((opt) => {
                const ativo = tiers[secao.key] === opt.valor;
                return (
                  <button key={opt.valor} onClick={() => setTier(secao.key, opt.valor)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                      ativo
                        ? "bg-[#3db8d4]/10 border-[#3db8d4] text-[#0f2d4a] dark:text-[#e8edf5]"
                        : "bg-zinc-50 dark:bg-[#1a2d45] border-zinc-200 dark:border-white/8 text-zinc-700 dark:text-[#c8dce8] hover:border-[#3db8d4]/50"
                    }`}>
                    <span className="flex-1 font-semibold">{opt.label}</span>
                    <span className={`text-xs font-bold shrink-0 ${ativo ? "text-[#3db8d4]" : "text-zinc-400 dark:text-[#3db8d4]/40"}`}>
                      +{opt.valor}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button onClick={calcular}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] text-white font-bold text-sm transition-colors">
          Calcular Child-Pugh
        </button>

        {resultado && cor && (
          <div className="rounded-xl border border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30] p-4 space-y-3">
            <div className="flex items-end gap-2">
              <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">{resultado.total}</p>
              <p className="text-sm text-zinc-400 dark:text-[#5a7a8e] mb-0.5">pontos</p>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-[#1a2d45] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${cor.bar}`} style={{ width: `${barWidth}%` }} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${cor.badge}`}>{resultado.label}</span>
              <span className="text-xs text-zinc-500 dark:text-[#7a9aae]">{resultado.descricao}</span>
            </div>
            <div className="border-t border-zinc-100 dark:border-white/8 pt-3 flex gap-4">
              <div>
                <p className="text-[10px] text-zinc-400 dark:text-[#5a7a8e] uppercase tracking-wide">Sobrevida 1 ano</p>
                <p className="text-lg font-extrabold text-[#0f2d4a] dark:text-[#e8edf5]">{resultado.sobrevida1ano}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 dark:text-[#5a7a8e] uppercase tracking-wide">Sobrevida 2 anos</p>
                <p className="text-lg font-extrabold text-[#0f2d4a] dark:text-[#e8edf5]">{resultado.sobrevida2anos}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
