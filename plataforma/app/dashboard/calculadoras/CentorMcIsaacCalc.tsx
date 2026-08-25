"use client";

import { useState } from "react";
import { calcularCentorMcIsaac, type CentorMcIsaacInput, type CentorResult } from "@/lib/calculadoras/centor-mcisaac";

const CRITERIOS_CENTOR = [
  { campo: "febre" as const,        label: "Febre > 38°C",                  sublabel: "" },
  { campo: "ausenciaTose" as const, label: "Ausência de tosse",              sublabel: "" },
  { campo: "adenopatia" as const,   label: "Adenopatia cervical anterior",   sublabel: "" },
  { campo: "exsudato" as const,     label: "Exsudato ou edema amigdaliano",  sublabel: "" },
];

const FAIXAS: { valor: CentorMcIsaacInput["faixaEtaria"]; label: string; ajuste: string }[] = [
  { valor: "3-14",  label: "3 a 14 anos",  ajuste: "+1" },
  { valor: "15-44", label: "15 a 44 anos", ajuste: "0"  },
  { valor: "45+",   label: "≥ 45 anos",    ajuste: "−1" },
];

const COR: Record<CentorResult["cor"], { badge: string; bar: string }> = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500" },
  amarelo:  { badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",   bar: "bg-yellow-500" },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",               bar: "bg-red-500"    },
};

const INITIAL: CentorMcIsaacInput = {
  febre: false, ausenciaTose: false, adenopatia: false, exsudato: false, faixaEtaria: null,
};

export default function CentorMcIsaacCalc() {
  const [valores, setValores] = useState<CentorMcIsaacInput>(INITIAL);
  const [resultado, setResultado] = useState<CentorResult | null>(null);

  function toggle(campo: "febre" | "ausenciaTose" | "adenopatia" | "exsudato") {
    setValores((v) => ({ ...v, [campo]: !v[campo] }));
    setResultado(null);
  }

  function setFaixa(faixa: CentorMcIsaacInput["faixaEtaria"]) {
    setValores((v) => ({ ...v, faixaEtaria: faixa }));
    setResultado(null);
  }

  function calcular() {
    if (!valores.faixaEtaria) return;
    setResultado(calcularCentorMcIsaac(valores));
  }

  const cor = resultado ? COR[resultado.cor] : null;
  const maxPontos = 5;
  const barWidth = resultado
    ? Math.round(((resultado.total + 1) / (maxPontos + 1)) * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] flex items-center justify-center shrink-0 overflow-hidden">
          <img src="/images/calculadoras/faringite.png" alt="faringite" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">Centor / McIsaac</p>
          <p className="text-xs text-[#0f2d4a] dark:text-[#5a7a8e]">Probabilidade de faringite bacteriana</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Critérios Centor */}
        <div>
          <p className="text-xs font-semibold text-[#0f2d4a] dark:text-[#6a8fa5] mb-2">Critérios clínicos (+1 cada):</p>
          <div className="space-y-2">
            {CRITERIOS_CENTOR.map((c) => {
              const ativo = valores[c.campo];
              return (
                <button
                  key={c.campo}
                  onClick={() => toggle(c.campo)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                    ativo
                      ? "bg-[#3db8d4]/10 border-[#3db8d4] text-[#0f2d4a] dark:text-[#e8edf5]"
                      : "bg-zinc-50 dark:bg-[#1a2d45] border-zinc-200 dark:border-white/8 text-zinc-700 dark:text-[#c8dce8] hover:border-[#3db8d4]/50"
                  }`}
                >
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded shrink-0 border-2 transition-all ${
                    ativo ? "bg-[#3db8d4] border-[#3db8d4]" : "border-zinc-300 dark:border-white/20"
                  }`}>
                    {ativo && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 6 5 9 10 3"/>
                      </svg>
                    )}
                  </span>
                  <span className="flex-1 font-medium">{c.label}</span>
                  <span className={`text-xs font-bold shrink-0 ${ativo ? "text-[#3db8d4]" : "text-zinc-300 dark:text-[#3a5a70]"}`}>
                    {ativo ? "+1" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Faixa etária McIsaac */}
        <div>
          <p className="text-xs font-semibold text-[#0f2d4a] dark:text-[#6a8fa5] mb-2">Faixa etária — ajuste McIsaac:</p>
          <div className="flex gap-2 flex-wrap">
            {FAIXAS.map((f) => {
              const ativo = valores.faixaEtaria === f.valor;
              return (
                <button
                  key={f.valor}
                  onClick={() => setFaixa(f.valor)}
                  className={`flex-1 min-w-0 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-center ${
                    ativo
                      ? "bg-[#3db8d4]/10 border-[#3db8d4] text-[#0f2d4a] dark:text-[#e8edf5]"
                      : "bg-zinc-50 dark:bg-[#1a2d45] border-zinc-200 dark:border-white/8 text-zinc-700 dark:text-[#c8dce8] hover:border-[#3db8d4]/50"
                  }`}
                >
                  <span className="block text-xs">{f.label}</span>
                  <span className={`text-[11px] font-bold ${ativo ? "text-[#3db8d4]" : "text-[#0f2d4a] dark:text-[#3a5a70]"}`}>
                    {f.ajuste}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={calcular}
          disabled={!valores.faixaEtaria}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors"
        >
          Calcular Centor/McIsaac
        </button>

        {resultado && cor && (
          <div className="rounded-xl border border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30] p-4 space-y-3">
            <div className="flex items-end gap-2">
              <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">{resultado.total}</p>
              <p className="text-sm text-[#0f2d4a] dark:text-[#5a7a8e] mb-0.5">/ {maxPontos} pontos</p>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-[#1a2d45] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${cor.bar}`} style={{ width: `${Math.max(barWidth, 4)}%` }} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${cor.badge}`}>
                {resultado.probabilidade} de faringite bacteriana
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-[#8aacbc] leading-relaxed border-t border-zinc-100 dark:border-white/8 pt-3">
              {resultado.conduta}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
