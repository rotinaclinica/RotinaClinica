"use client";

import { useState } from "react";
import { calcularHasbled, type HasbledInput, type HasbledResult } from "@/lib/calculadoras/hasbled";

const CRITERIOS: { campo: keyof HasbledInput; sigla: string; label: string }[] = [
  { campo: "hipertensao",       sigla: "H",  label: "Hipertensão não controlada (PAS > 160 mmHg)" },
  { campo: "disfuncaoRenal",    sigla: "A₁", label: "Disfunção renal (diálise, Cr > 2,26 mg/dL)"  },
  { campo: "disfuncaoHepatica", sigla: "A₂", label: "Disfunção hepática (cirrose ou bilirrubina > 2× normal)" },
  { campo: "avc",               sigla: "S",  label: "Histórico de AVC"                             },
  { campo: "sangramento",       sigla: "B",  label: "Sangramento prévio ou predisposição"          },
  { campo: "inrLabil",          sigla: "L",  label: "INR lábil (tempo na faixa terapêutica < 60%)" },
  { campo: "idadeAcima65",      sigla: "E",  label: "Idade > 65 anos"                              },
  { campo: "medicamentos",      sigla: "D₁", label: "Antiagregantes ou AINEs (AAS, clopidogrel)"  },
  { campo: "alcool",            sigla: "D₂", label: "Uso de álcool (≥ 8 doses/semana)"            },
];

const COR: Record<HasbledResult["cor"], { badge: string; bar: string }> = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500" },
  amarelo:  { badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",   bar: "bg-yellow-500" },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",               bar: "bg-red-500"    },
};

const INITIAL: HasbledInput = {
  hipertensao: false, disfuncaoRenal: false, disfuncaoHepatica: false,
  avc: false, sangramento: false, inrLabil: false, idadeAcima65: false,
  medicamentos: false, alcool: false,
};

export default function HasbledCalc() {
  const [valores, setValores] = useState<HasbledInput>(INITIAL);
  const [resultado, setResultado] = useState<HasbledResult | null>(null);

  function toggle(campo: keyof HasbledInput) {
    setValores((v) => ({ ...v, [campo]: !v[campo] }));
    setResultado(null);
  }

  const cor = resultado ? COR[resultado.cor] : null;
  const barWidth = resultado ? Math.round((resultado.total / resultado.maxPontos) * 100) : 0;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] flex items-center justify-center shrink-0 overflow-hidden">
          <img src="/images/calculadoras/coracao.png" alt="coração" className="w-full h-full object-contain" />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">HAS-BLED</p>
          <p className="text-xs text-zinc-400 dark:text-[#5a7a8e]">Risco de sangramento maior em anticoagulados</p>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <p className="text-xs text-zinc-500 dark:text-[#6a8fa5]">Marque os critérios presentes (+1 ponto cada):</p>

        {CRITERIOS.map((c) => {
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
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold shrink-0 ${
                ativo ? "bg-[#3db8d4] text-[#0f2d4a]" : "bg-zinc-200 dark:bg-[#3db8d4]/20 text-zinc-500 dark:text-zinc-300"
              }`}>
                {c.sigla}
              </span>
              <span className="flex-1 min-w-0 font-semibold">{c.label}</span>
              <span className={`text-xs font-bold shrink-0 ${ativo ? "text-[#3db8d4]" : "text-zinc-300 dark:text-[#3a5a70]"}`}>
                {ativo ? "+1" : ""}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setResultado(calcularHasbled(valores))}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] text-white font-bold text-sm transition-colors mt-2"
        >
          Calcular HAS-BLED
        </button>

        {resultado && cor && (
          <div className="rounded-xl border border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30] p-4 space-y-3">
            <div className="flex items-end gap-2">
              <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">{resultado.total}</p>
              <p className="text-sm text-zinc-400 dark:text-[#5a7a8e] mb-0.5">/ {resultado.maxPontos} pontos</p>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-[#1a2d45] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${cor.bar}`} style={{ width: `${Math.max(barWidth, 4)}%` }} />
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${cor.badge}`}>
                {resultado.grupo} — {resultado.riscoAnual}/ano
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
