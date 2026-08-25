"use client";

import { useState } from "react";
import { calcularQsofa, type QsofaInput, type QsofaResult } from "@/lib/calculadoras/qsofa";

const COR: Record<QsofaResult["cor"], { badge: string; bar: string }> = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500" },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",               bar: "bg-red-500" },
};

const CRITERIOS: { campo: keyof QsofaInput; label: string; sublabel: string }[] = [
  { campo: "statusMental", label: "Alteração do estado mental",  sublabel: "GCS < 15" },
  { campo: "fr22",         label: "Frequência respiratória ≥ 22 irpm", sublabel: "" },
  { campo: "pas100",       label: "Pressão arterial sistólica ≤ 100 mmHg", sublabel: "" },
];

const INITIAL: QsofaInput = { statusMental: false, fr22: false, pas100: false };

export default function QsofaCalc() {
  const [flags, setFlags] = useState<QsofaInput>(INITIAL);
  const [resultado, setResultado] = useState<QsofaResult | null>(null);

  function toggle(campo: keyof QsofaInput) {
    setFlags((f) => ({ ...f, [campo]: !f[campo] }));
    setResultado(null);
  }

  function calcular() {
    setResultado(calcularQsofa(flags));
  }

  const cor = resultado ? COR[resultado.cor] : null;
  const barWidth = resultado ? Math.round((resultado.total / 3) * 100) : 0;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      {/* Cabeçalho */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] overflow-hidden shrink-0">
          <img src="/images/calculadoras/sepsis.png" alt="sepse" className="w-full h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">qSOFA</p>
          <p className="text-xs text-[#0f2d4a] dark:text-[#5a7a8e]">Triagem rápida de sepse à beira-leito</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <p className="text-[11px] font-bold text-[#0f2d4a] dark:text-[#5a7a8e] uppercase tracking-widest">Critérios</p>
        <div className="flex flex-col gap-1.5">
          {CRITERIOS.map((item) => {
            const ativo = flags[item.campo];
            return (
              <button key={item.campo} onClick={() => toggle(item.campo)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                  ativo
                    ? "bg-[#3db8d4]/10 border-[#3db8d4] text-[#0f2d4a] dark:text-[#e8edf5]"
                    : "bg-zinc-50 dark:bg-[#1a2d45] border-zinc-200 dark:border-white/8 text-zinc-700 dark:text-[#c8dce8] hover:border-[#3db8d4]/50"
                }`}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold leading-snug">{item.label}</p>
                  {item.sublabel && (
                    <p className="text-[11px] text-[#0f2d4a] dark:text-[#8aacbc] mt-0.5">{item.sublabel}</p>
                  )}
                </div>
                <span className={`text-xs font-bold shrink-0 ${ativo ? "text-[#3db8d4]" : "text-zinc-400 dark:text-[#3db8d4]/40"}`}>
                  +1
                </span>
              </button>
            );
          })}
        </div>

        <button onClick={calcular}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] text-white font-bold text-sm transition-colors">
          Calcular qSOFA
        </button>

        {resultado && cor && (
          <div className="rounded-xl border border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30] p-4 space-y-3">
            <div className="flex items-end gap-2">
              <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">{resultado.total}</p>
              <p className="text-sm text-[#0f2d4a] dark:text-[#5a7a8e] mb-0.5">pontos</p>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-[#1a2d45] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${cor.bar}`} style={{ width: `${barWidth}%` }} />
            </div>
            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${cor.badge}`}>{resultado.label}</span>
            <p className="text-xs text-zinc-600 dark:text-[#8aacbc] leading-relaxed border-t border-zinc-100 dark:border-white/8 pt-3">
              {resultado.conduta}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
