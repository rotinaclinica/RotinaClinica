"use client";

import { useState } from "react";
import {
  calcularNoradrenalina, SOLUCOES,
  type NoradrenalinaInput, type NoradrenalinaResult, type SolucaoNora,
} from "@/lib/calculadoras/noradrenalina";

const COR: Record<NoradrenalinaResult["cor"], { badge: string; bar: string }> = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500" },
  amarelo:  { badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",   bar: "bg-yellow-500" },
  laranja:  { badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",   bar: "bg-orange-500" },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",               bar: "bg-red-500" },
};

export default function NoradrenalinaCalc() {
  const [vazao, setVazao]     = useState("");
  const [peso, setPeso]       = useState("");
  const [solucao, setSolucao] = useState<SolucaoNora>("padrao");
  const [resultado, setResultado] = useState<NoradrenalinaResult | null>(null);
  const [erro, setErro]       = useState("");

  function calcular() {
    const v = parseFloat(vazao.replace(",", "."));
    const p = parseFloat(peso.replace(",", "."));
    if (isNaN(v) || isNaN(p) || v <= 0 || p <= 0) {
      setErro("Informe vazão e peso válidos.");
      return;
    }
    setErro("");
    const input: NoradrenalinaInput = { vazao: v, peso: p, solucao };
    setResultado(calcularNoradrenalina(input));
  }

  function reset() { setResultado(null); setErro(""); }

  const cor = resultado ? COR[resultado.cor] : null;
  const barWidth = resultado ? Math.min(100, Math.round((resultado.dose / 3.3) * 100)) : 0;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] overflow-hidden shrink-0 flex items-center justify-center">
          <img src="/images/calculadoras/noradrenalina.png" alt="noradrenalina" className="w-full h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">Noradrenalina — Dose BIC</p>
          <p className="text-xs text-zinc-400 dark:text-[#5a7a8e]">mcg/kg/min a partir da vazão em mL/h</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Seleção de solução */}
        <div>
          <p className="text-[11px] font-bold text-zinc-400 dark:text-[#5a7a8e] uppercase tracking-widest mb-2">Solução</p>
          <div className="flex flex-col gap-1.5">
            {(["padrao", "concentrada"] as SolucaoNora[]).map((s) => {
              const ativo = solucao === s;
              return (
                <button key={s} onClick={() => { setSolucao(s); reset(); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                    ativo
                      ? "bg-[#3db8d4]/10 border-[#3db8d4] text-[#0f2d4a] dark:text-[#e8edf5]"
                      : "bg-zinc-50 dark:bg-[#1a2d45] border-zinc-200 dark:border-white/8 text-zinc-700 dark:text-[#c8dce8] hover:border-[#3db8d4]/50"
                  }`}>
                  <span className="flex-1 font-semibold">{SOLUCOES[s].label}</span>
                  <span className="text-[11px] text-zinc-400 dark:text-[#5a7a8e]">{SOLUCOES[s].descricao}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs numéricos */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-zinc-500 dark:text-[#8aacbc] mb-1 block">Vazão (mL/h)</label>
            <input type="number" value={vazao} placeholder="ex: 15"
              onChange={(e) => { setVazao(e.target.value); reset(); }}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#1a2d45] text-sm text-zinc-900 dark:text-[#e8edf5] placeholder:text-zinc-400 dark:placeholder:text-[#4a6a7e] focus:outline-none focus:ring-2 focus:ring-[#3db8d4] focus:border-transparent" />
          </div>
          <div>
            <label className="text-[11px] text-zinc-500 dark:text-[#8aacbc] mb-1 block">Peso (kg)</label>
            <input type="number" value={peso} placeholder="ex: 70"
              onChange={(e) => { setPeso(e.target.value); reset(); }}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#1a2d45] text-sm text-zinc-900 dark:text-[#e8edf5] placeholder:text-zinc-400 dark:placeholder:text-[#4a6a7e] focus:outline-none focus:ring-2 focus:ring-[#3db8d4] focus:border-transparent" />
          </div>
        </div>

        {erro && <p className="text-xs text-red-500 dark:text-red-400">{erro}</p>}

        <button onClick={calcular}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] text-white font-bold text-sm transition-colors">
          Calcular Dose
        </button>

        {resultado && cor && (
          <div className="rounded-xl border border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30] p-4 space-y-3">
            <div className="flex items-end gap-2">
              <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">
                {resultado.dose.toFixed(3)}
              </p>
              <p className="text-sm text-zinc-400 dark:text-[#5a7a8e] mb-0.5">mcg/kg/min</p>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-[#1a2d45] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${cor.bar}`} style={{ width: `${barWidth}%` }} />
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-[#5a7a8e]">
              Referência: 0,05–3,3 mcg/kg/min (UpToDate)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
