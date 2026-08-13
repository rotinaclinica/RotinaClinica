"use client";

import { useState } from "react";
import {
  calcularSofa, type SofaInput, type SofaResult,
  PLAQUETAS_OPTIONS, GLASGOW_OPTIONS, BILIRRUBINA_OPTIONS,
  CARDIOVASCULAR_OPTIONS, RENAL_OPTIONS,
} from "@/lib/calculadoras/sofa";

const COR: Record<SofaResult["cor"], { badge: string; bar: string; dot: string }> = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500", dot: "bg-emerald-500" },
  amarelo:  { badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",   bar: "bg-yellow-500", dot: "bg-yellow-500" },
  laranja:  { badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",   bar: "bg-orange-500", dot: "bg-orange-500" },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",               bar: "bg-red-500",    dot: "bg-red-500" },
};

type TierKey = "plaquetas" | "glasgow" | "bilirrubina" | "cardiovascular" | "renal";

type TierOption = { valor: 0 | 1 | 2 | 3 | 4; label: string };

const SECOES: { key: TierKey; titulo: string; sublabel?: string; options: TierOption[] }[] = [
  { key: "plaquetas",      titulo: "Coagulação — Plaquetas (×10³/μL)",  options: PLAQUETAS_OPTIONS },
  { key: "glasgow",        titulo: "Neurológico — Glasgow (GCS)",        sublabel: "Se em sedação, estime o valor sem sedação", options: GLASGOW_OPTIONS },
  { key: "bilirrubina",    titulo: "Hepático — Bilirrubina",             options: BILIRRUBINA_OPTIONS },
  { key: "cardiovascular", titulo: "Cardiovascular — PAM / Vasopressores", sublabel: "Doses em μg/kg/min", options: CARDIOVASCULAR_OPTIONS },
  { key: "renal",          titulo: "Renal — Creatinina ou Diurese",      options: RENAL_OPTIONS },
];

const TIER_INITIAL: Record<TierKey, 0 | 1 | 2 | 3 | 4> = {
  plaquetas: 0, glasgow: 0, bilirrubina: 0, cardiovascular: 0, renal: 0,
};

export default function SofaCalc() {
  const [pao2, setPao2] = useState<string>("");
  const [fio2, setFio2] = useState<string>("");
  const [vm, setVm] = useState(false);
  const [tiers, setTiers] = useState<Record<TierKey, 0 | 1 | 2 | 3 | 4>>(TIER_INITIAL);
  const [resultado, setResultado] = useState<SofaResult | null>(null);

  function setTier(key: TierKey, val: 0 | 1 | 2 | 3 | 4) {
    setTiers((t) => ({ ...t, [key]: val }));
    setResultado(null);
  }

  function calcular() {
    const input: SofaInput = {
      pao2: pao2 !== "" ? Number(pao2) : null,
      fio2: fio2 !== "" ? Number(fio2) : null,
      ventMecanica: vm,
      ...tiers,
    };
    setResultado(calcularSofa(input));
  }

  const cor = resultado ? COR[resultado.cor] : null;
  const barWidth = resultado ? Math.min(100, Math.round((resultado.total / 24) * 100)) : 0;

  const pfRatioDisplay = pao2 !== "" && fio2 !== "" && Number(fio2) > 0
    ? Math.round(Number(pao2) / (Number(fio2) / 100))
    : null;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      {/* Cabeçalho */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] overflow-hidden shrink-0">
          <img src="/images/calculadoras/sepsis.png" alt="sepse" className="w-full h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">SOFA</p>
          <p className="text-xs text-zinc-400 dark:text-[#5a7a8e]">Avaliação sequencial de disfunção orgânica</p>
        </div>
      </div>

      <div className="p-5 space-y-6">

        {/* Respiratório */}
        <div>
          <p className="text-[11px] font-bold text-zinc-400 dark:text-[#5a7a8e] uppercase tracking-widest mb-2">
            Respiratório — PaO₂ / FiO₂
          </p>
          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <label className="text-[11px] text-zinc-500 dark:text-[#8aacbc] mb-1 block">PaO₂ (mm Hg)</label>
              <input
                type="number" min="0" max="600" value={pao2}
                onChange={(e) => { setPao2(e.target.value); setResultado(null); }}
                placeholder="ex: 80"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#1a2d45] text-sm text-zinc-900 dark:text-[#e8edf5] placeholder:text-zinc-400 dark:placeholder:text-[#4a6a7e] focus:outline-none focus:ring-2 focus:ring-[#3db8d4] focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] text-zinc-500 dark:text-[#8aacbc] mb-1 block">FiO₂ (%)</label>
              <input
                type="number" min="21" max="100" value={fio2}
                onChange={(e) => { setFio2(e.target.value); setResultado(null); }}
                placeholder="ex: 40"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#1a2d45] text-sm text-zinc-900 dark:text-[#e8edf5] placeholder:text-zinc-400 dark:placeholder:text-[#4a6a7e] focus:outline-none focus:ring-2 focus:ring-[#3db8d4] focus:border-transparent"
              />
            </div>
          </div>

          {pfRatioDisplay !== null && (
            <p className="text-xs text-zinc-500 dark:text-[#8aacbc] mb-2">
              Relação P/F calculada: <span className="font-bold text-[#0f2d4a] dark:text-[#e8edf5]">{pfRatioDisplay}</span>
            </p>
          )}

          {/* VM toggle */}
          <button onClick={() => { setVm((v) => !v); setResultado(null); }}
            className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${
              vm
                ? "bg-[#3db8d4]/10 border-[#3db8d4] text-[#0f2d4a] dark:text-[#e8edf5]"
                : "bg-zinc-50 dark:bg-[#1a2d45] border-zinc-200 dark:border-white/8 text-zinc-700 dark:text-[#c8dce8] hover:border-[#3db8d4]/50"
            }`}>
            <span className="flex-1 font-semibold">Em ventilação mecânica</span>
            <span className="text-[11px] text-zinc-400 dark:text-[#5a7a8e]">incluindo CPAP</span>
          </button>
        </div>

        {/* Demais componentes */}
        {SECOES.map((secao) => (
          <div key={secao.key}>
            <p className="text-[11px] font-bold text-zinc-400 dark:text-[#5a7a8e] uppercase tracking-widest mb-0.5">
              {secao.titulo}
            </p>
            {secao.sublabel && (
              <p className="text-[11px] text-zinc-400 dark:text-[#5a7a8e] mb-2 italic">{secao.sublabel}</p>
            )}
            {!secao.sublabel && <div className="mb-2" />}
            <div className="flex flex-col gap-1.5">
              {secao.options.map((opt) => {
                const ativo = tiers[secao.key] === opt.valor;
                return (
                  <button key={opt.valor} onClick={() => setTier(secao.key, opt.valor)}
                    className={`w-full text-left px-3 py-2 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                      ativo
                        ? "bg-[#3db8d4]/10 border-[#3db8d4] text-[#0f2d4a] dark:text-[#e8edf5]"
                        : "bg-zinc-50 dark:bg-[#1a2d45] border-zinc-200 dark:border-white/8 text-zinc-700 dark:text-[#c8dce8] hover:border-[#3db8d4]/50"
                    }`}>
                    <span className="flex-1 font-semibold leading-snug">{opt.label}</span>
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
          Calcular SOFA
        </button>

        {resultado && cor && (
          <div className="rounded-xl border border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30] p-4 space-y-3">
            <div className="flex items-end gap-2">
              <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">{resultado.total}</p>
              <p className="text-sm text-zinc-400 dark:text-[#5a7a8e] mb-0.5">pontos</p>
              <p className="text-xs text-zinc-400 dark:text-[#5a7a8e] mb-0.5 ml-1">/ 24</p>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-[#1a2d45] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${cor.bar}`} style={{ width: `${barWidth}%` }} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${cor.badge}`}>{resultado.label}</span>
              <span className="text-xs text-zinc-500 dark:text-[#7a9aae]">
                Mortalidade hospitalar estimada: <span className="font-bold">{resultado.mortalidade}</span>
              </span>
            </div>
            {resultado.respiratorio === null && (
              <p className="text-[11px] text-zinc-400 dark:text-[#5a7a8e] italic border-t border-zinc-100 dark:border-white/8 pt-2">
                PaO₂/FiO₂ não informado — componente respiratório calculado como 0.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
