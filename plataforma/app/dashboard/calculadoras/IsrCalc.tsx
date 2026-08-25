"use client";

import { useState } from "react";
import { ISR_CATEGORIAS, calcularDoseISR } from "@/lib/calculadoras/isr";

// inicializa todas as apresentações no índice 0
const initApIdx = () => {
  const m: Record<string, number> = {};
  ISR_CATEGORIAS.forEach((cat) => cat.medicamentos.forEach((med) => { m[med.nome] = 0; }));
  return m;
};

export default function IsrCalc() {
  const [peso, setPeso]     = useState("");
  const [apIdx, setApIdx]   = useState<Record<string, number>>(initApIdx);

  const p         = parseFloat(peso.replace(",", "."));
  const pesoValido = !isNaN(p) && p > 0;

  function selAp(nome: string, idx: number) {
    setApIdx((prev) => ({ ...prev, [nome]: idx }));
  }

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] overflow-hidden shrink-0 flex items-center justify-center">
          <img src="/images/calculadoras/isr.png" alt="ISR" className="w-full h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">ISR — Intubação em Sequência Rápida</p>
          <p className="text-xs text-[#0f2d4a] dark:text-[#5a7a8e]">Doses calculadas pelo peso do paciente</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label className="text-[11px] text-[#0f2d4a] dark:text-[#8aacbc] mb-1 block">Peso do paciente (kg)</label>
          <input
            type="number" value={peso} placeholder="ex: 70"
            onChange={(e) => setPeso(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#1a2d45] text-sm text-zinc-900 dark:text-[#e8edf5] placeholder:text-zinc-400 dark:placeholder:text-[#4a6a7e] focus:outline-none focus:ring-2 focus:ring-[#3db8d4] focus:border-transparent"
          />
        </div>

        <div className="space-y-3">
          {ISR_CATEGORIAS.map((cat) => (
            <div key={cat.nome} className="rounded-xl border border-zinc-100 dark:border-white/8 overflow-hidden">
              {/* Header categoria */}
              <div className="px-3 py-2 bg-[#0f2d4a] dark:bg-[#0a1628]">
                <p className="text-[11px] font-bold text-[#3db8d4] uppercase tracking-widest">{cat.nome}</p>
              </div>

              {/* Cabeçalho colunas */}
              <div className="grid grid-cols-2 px-3 py-1.5 bg-zinc-50 dark:bg-[#0f1e30] border-b border-zinc-100 dark:border-white/8">
                <p className="text-[10px] font-bold text-[#0f2d4a] dark:text-[#4a6a7e] uppercase tracking-wide">Medicamento</p>
                {pesoValido && <p className="text-[10px] font-bold text-[#0f2d4a] dark:text-[#4a6a7e] uppercase tracking-wide">Dose calculada</p>}
              </div>

              {cat.medicamentos.map((med, i) => {
                const idx  = apIdx[med.nome] ?? 0;
                const ap   = med.apresentacoes[idx];
                const calc = pesoValido ? calcularDoseISR(med, p, ap.conc) : null;
                const isLast = i === cat.medicamentos.length - 1;

                return (
                  <div key={med.nome}
                    className={`px-3 py-2.5 ${!isLast ? "border-b border-zinc-100 dark:border-white/8" : ""}`}>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Coluna esquerda: nome + dose base + seletor de apresentação */}
                      <div className="space-y-1.5">
                        <div>
                          <p className="text-sm font-semibold text-[#0f2d4a] dark:text-[#e8edf5]">{med.nome}</p>
                          <p className="text-[11px] text-[#0f2d4a] dark:text-[#5a7a8e]">
                            {med.doseMin}{med.doseMax ? `–${med.doseMax}` : ""} {med.unidade}
                          </p>
                        </div>
                        {/* Seletor de apresentação */}
                        <div className="flex flex-wrap gap-1">
                          {med.apresentacoes.map((a, ai) => (
                            <button key={ai} onClick={() => selAp(med.nome, ai)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                                ai === idx
                                  ? "bg-[#3db8d4]/15 border-[#3db8d4] text-[#3db8d4]"
                                  : "bg-zinc-100 dark:bg-[#1a2d45] border-zinc-200 dark:border-white/8 text-zinc-500 dark:text-[#5a7a8e] hover:border-[#3db8d4]/50"
                              }`}>
                              {a.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Coluna direita: dose e volume calculados */}
                      {calc && (
                        <div>
                          <p className="text-sm font-bold text-[#0f2d4a] dark:text-[#e8edf5]">{calc.volStr}</p>
                          <p className="text-[11px] text-[#0f2d4a] dark:text-[#5a7a8e]">{calc.doseStr}</p>
                          {ap.nota && (
                            <p className="text-[10px] text-[#0f2d4a] dark:text-[#4a6a7e] mt-0.5">{ap.nota}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
