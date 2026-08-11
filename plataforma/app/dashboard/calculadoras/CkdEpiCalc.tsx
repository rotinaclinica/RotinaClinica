"use client";

import { useState } from "react";
import { calcularCkdEpi, type CkdEpiResult, type Sexo } from "@/lib/calculadoras/ckd-epi";

const COR_CLASSES: Record<CkdEpiResult["cor"], { badge: string; bar: string }> = {
  "verde":         { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500" },
  "amarelo-verde": { badge: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300",             bar: "bg-lime-500" },
  "amarelo":       { badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",     bar: "bg-yellow-500" },
  "laranja":       { badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",     bar: "bg-orange-500" },
  "vermelho":      { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",                 bar: "bg-red-500" },
};

export default function CkdEpiCalc() {
  const [sexo, setSexo] = useState<Sexo>("M");
  const [idade, setIdade] = useState("");
  const [creatinina, setCreatinina] = useState("");
  const [resultado, setResultado] = useState<CkdEpiResult | null>(null);
  const [erro, setErro] = useState("");

  function calcular() {
    setErro("");
    setResultado(null);

    const id = parseInt(idade, 10);
    const cr = parseFloat(creatinina.replace(",", "."));

    if (!idade || isNaN(id) || id < 18 || id > 120) {
      setErro("Idade deve ser entre 18 e 120 anos.");
      return;
    }
    if (!creatinina || isNaN(cr) || cr <= 0) {
      setErro("Insira um valor de creatinina válido (> 0 mg/dL).");
      return;
    }

    setResultado(calcularCkdEpi({ sexo, idade: id, creatinina: cr }));
  }

  const cor = resultado ? COR_CLASSES[resultado.cor] : null;
  const barWidth = resultado ? Math.min(100, Math.round((resultado.egfr / 120) * 100)) : 0;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      {/* Cabeçalho */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#0f1e30] flex items-center justify-center shrink-0">
          <img src="/images/calculadoras/ckd-epi.png" alt="rim" className="w-full h-full object-contain" />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">CKD-EPI 2021</p>
          <p className="text-xs text-zinc-400 dark:text-[#5a7a8e]">Taxa de Filtração Glomerular estimada (TFGe)</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Sexo */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-[#6a8fa5] uppercase tracking-wide mb-2">Sexo biológico</label>
          <div className="flex gap-2">
            {(["M", "F"] as Sexo[]).map((s) => (
              <button
                key={s}
                onClick={() => setSexo(s)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  sexo === s
                    ? "bg-[#3db8d4] text-white border-[#3db8d4]"
                    : "bg-zinc-50 dark:bg-[#1a2d45] text-zinc-500 dark:text-[#6a8fa5] border-zinc-200 dark:border-white/8 hover:border-[#3db8d4]/50"
                }`}
              >
                {s === "M" ? "Masculino" : "Feminino"}
              </button>
            ))}
          </div>
        </div>

        {/* Campos numéricos */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-[#6a8fa5] uppercase tracking-wide mb-1.5">
              Idade <span className="normal-case font-normal">(anos)</span>
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={18}
              max={120}
              placeholder="ex: 65"
              value={idade}
              onChange={(e) => setIdade(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0f1e30] text-[#0f2d4a] dark:text-[#e8edf5] placeholder:text-zinc-300 dark:placeholder:text-[#3a5a70] focus:outline-none focus:border-[#3db8d4] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-[#6a8fa5] uppercase tracking-wide mb-1.5">
              Creatinina <span className="normal-case font-normal">(mg/dL)</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="ex: 1.2"
              value={creatinina}
              onChange={(e) => setCreatinina(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0f1e30] text-[#0f2d4a] dark:text-[#e8edf5] placeholder:text-zinc-300 dark:placeholder:text-[#3a5a70] focus:outline-none focus:border-[#3db8d4] transition-colors"
            />
          </div>
        </div>

        {erro && (
          <p className="text-xs text-red-500 dark:text-red-400">{erro}</p>
        )}

        <button
          onClick={calcular}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] text-white font-bold text-sm transition-colors"
        >
          Calcular TFGe
        </button>

        {/* Resultado */}
        {resultado && cor && (
          <div className="rounded-xl border border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30] p-4 space-y-3">
            {/* Valor */}
            <p className="text-3xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">
              {resultado.egfr}
              <span className="text-sm font-normal text-zinc-400 dark:text-[#5a7a8e] ml-1.5">mL/min/1,73 m²</span>
            </p>

            {/* Barra visual */}
            <div className="h-2 w-full bg-zinc-200 dark:bg-[#1a2d45] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${cor.bar}`}
                style={{ width: `${barWidth}%` }}
              />
            </div>

            {/* Estágio */}
            <p className="text-xs text-zinc-500 dark:text-[#6a8fa5]">
              Se DRC:{" "}
              <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${cor.badge}`}>
                Estágio {resultado.estadio}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
