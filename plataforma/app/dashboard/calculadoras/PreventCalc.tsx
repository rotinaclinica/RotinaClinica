"use client";

import { useState } from "react";
import { calcularPrevent, type PreventInput, type PreventResult } from "@/lib/calculadoras/prevent";

const INITIAL: PreventInput = {
  sexo: "M", idade: 55, pas: 120,
  colesterolTotal: 200, hdl: 50, egfr: 90,
  diabetes: false, tabagismo: false, estatina: false, antihipertensivo: false,
};

const COR = {
  baixo:        { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500", label: "Baixo risco" },
  intermediario:{ badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",   bar: "bg-yellow-500", label: "Risco intermediário" },
  alto:         { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",               bar: "bg-red-500",    label: "Alto risco" },
};

function NumInput({ label, sublabel, value, min, max, step = 1, onChange }: {
  label: string; sublabel?: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-600 dark:text-[#8aacbc] mb-1">
        {label}
        {sublabel && <span className="font-normal text-zinc-400 dark:text-[#5a7a8e] ml-1">{sublabel}</span>}
      </label>
      <input
        type="number" min={min} max={max} step={step} value={value}
        onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }}
        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0e1825] text-sm text-zinc-900 dark:text-[#e8edf5] focus:outline-none focus:ring-2 focus:ring-[#3db8d4] focus:border-transparent"
      />
      <p className="text-[10px] text-zinc-400 dark:text-[#3a5a70] mt-0.5">{min}–{max}</p>
    </div>
  );
}

function BoolInput({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold text-zinc-600 dark:text-[#8aacbc] mb-1.5">{label}</p>
      <div className="flex gap-2">
        {([{ v: false, l: "Não" }, { v: true, l: "Sim" }] as const).map(({ v, l }) => (
          <button key={l} onClick={() => onChange(v)}
            className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
              value === v
                ? "bg-[#3db8d4]/10 border-[#3db8d4] text-[#0f2d4a] dark:text-[#e8edf5]"
                : "bg-zinc-50 dark:bg-[#1a2d45] border-zinc-200 dark:border-white/8 text-zinc-600 dark:text-[#c8dce8] hover:border-[#3db8d4]/50"
            }`}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PreventCalc() {
  const [input, setInput] = useState<PreventInput>(INITIAL);
  const [resultado, setResultado] = useState<PreventResult | null>(null);

  function set<K extends keyof PreventInput>(key: K, val: PreventInput[K]) {
    setInput((v) => ({ ...v, [key]: val }));
    setResultado(null);
  }

  const cor = resultado ? COR[resultado.categoria] : null;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] flex items-center justify-center shrink-0 overflow-hidden">
          <img src="/images/calculadoras/coracao.png" alt="coração" className="w-full h-full object-contain" />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">PREVENT — AHA 2023</p>
          <p className="text-xs text-zinc-400 dark:text-[#5a7a8e]">Risco cardiovascular total em 10 anos</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Sexo */}
        <div>
          <p className="text-xs font-semibold text-zinc-600 dark:text-[#8aacbc] mb-1.5">Sexo</p>
          <div className="flex gap-2">
            {([["M", "Masculino"], ["F", "Feminino"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => set("sexo", v)}
                className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  input.sexo === v
                    ? "bg-[#3db8d4]/10 border-[#3db8d4] text-[#0f2d4a] dark:text-[#e8edf5]"
                    : "bg-zinc-50 dark:bg-[#1a2d45] border-zinc-200 dark:border-white/8 text-zinc-600 dark:text-[#c8dce8] hover:border-[#3db8d4]/50"
                }`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs numéricos */}
        <div className="grid grid-cols-2 gap-3">
          <NumInput label="Idade" sublabel="anos" value={input.idade} min={30} max={79} onChange={(v) => set("idade", v)} />
          <NumInput label="PAS" sublabel="mmHg" value={input.pas} min={90} max={200} onChange={(v) => set("pas", v)} />
          <NumInput label="Colesterol total" sublabel="mg/dL" value={input.colesterolTotal} min={130} max={320} onChange={(v) => set("colesterolTotal", v)} />
          <NumInput label="HDL" sublabel="mg/dL" value={input.hdl} min={20} max={100} onChange={(v) => set("hdl", v)} />
          <NumInput label="eGFR" sublabel="mL/min/1,73m²" value={input.egfr} min={15} max={140} onChange={(v) => set("egfr", v)} />
        </div>

        {/* Inputs booleanos */}
        <div className="grid grid-cols-2 gap-3">
          <BoolInput label="Diabetes" value={input.diabetes} onChange={(v) => set("diabetes", v)} />
          <BoolInput label="Tabagismo atual" value={input.tabagismo} onChange={(v) => set("tabagismo", v)} />
          <BoolInput label="Estatina" value={input.estatina} onChange={(v) => set("estatina", v)} />
          <BoolInput label="Anti-hipertensivo" value={input.antihipertensivo} onChange={(v) => set("antihipertensivo", v)} />
        </div>

        <button onClick={() => setResultado(calcularPrevent(input))}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] text-white font-bold text-sm transition-colors">
          Calcular PREVENT
        </button>

        {/* Resultado */}
        {resultado && cor && (
          <div className="rounded-xl border border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30] p-4 space-y-3">
            <p className="text-xs font-bold text-zinc-500 dark:text-[#6a8fa5] uppercase tracking-wide">Risco cardiovascular total em 10 anos</p>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">{resultado.risco10yr.toFixed(1)}%</p>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-[#1a2d45] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${cor.bar}`}
                style={{ width: `${Math.min(resultado.risco10yr * 3.5, 100)}%` }} />
            </div>
            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${cor.badge}`}>{cor.label}</span>
          </div>
        )}

        <p className="text-[10px] text-zinc-400 dark:text-[#3a5a70] leading-relaxed">
          Modelo de regressão logística baseado em: Khan SS, et al. <em>Circulation.</em> 2023;148:1982–2004.
          Coeficientes conforme implementação MDCalc. Valide resultados contra a calculadora oficial da AHA (tools.acc.org/PREVENT).
        </p>
      </div>
    </div>
  );
}
