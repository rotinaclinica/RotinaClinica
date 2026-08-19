"use client";

import { useState } from "react";
import {
  calcEtapaUm, calcDiluicao, fmt, fmtConc,
  type TipoFrasco, type EtapaUmResult, type DiluicaoResult,
} from "@/lib/calculadoras/reconstituicao";

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
        onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v) && v >= min) onChange(v); }}
        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0e1825] text-sm text-zinc-900 dark:text-[#e8edf5] focus:outline-none focus:ring-2 focus:ring-[#3db8d4] focus:border-transparent"
      />
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-white/6 last:border-0">
      <span className="text-xs text-zinc-500 dark:text-[#6a8fa5]">{label}</span>
      <span className="text-sm font-bold text-[#0f2d4a] dark:text-[#e8edf5]">{value}</span>
    </div>
  );
}

function DiluicaoCard({ vol, conc, totalMg }: { vol: number; conc: number; totalMg: number }) {
  const cor =
    conc > 10 ? "border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-900/10" :
    conc > 1  ? "border-zinc-200 dark:border-white/8 bg-white dark:bg-[#131c2e]" :
                "border-emerald-200 dark:border-emerald-700/40 bg-emerald-50 dark:bg-emerald-900/10";

  return (
    <div className={`rounded-xl border p-4 space-y-1 ${cor}`}>
      <p className="text-xs font-bold text-zinc-400 dark:text-[#5a7a8e] uppercase tracking-wide">{vol} mL SF/SG</p>
      <p className="text-xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5]">{fmtConc(conc)}</p>
      <p className="text-[11px] text-zinc-400 dark:text-[#5a7a8e]">{fmt(totalMg)} em {vol} mL</p>
    </div>
  );
}

export default function ReconstitucaoCalc() {
  const [tipo, setTipo] = useState<TipoFrasco>("po");

  // Etapa 1 — frasco pó
  const [mgFrasco, setMgFrasco] = useState(500);
  const [volReconstituicao, setVolReconstituicao] = useState(10);

  // Etapa 1 — ampola líquida
  const [concentracaoAmpola, setConcentracaoAmpola] = useState(50);
  const [volAmpola, setVolAmpola] = useState(10);

  // Etapa 2
  const [volDraw, setVolDraw] = useState(5);

  const [etapaUm, setEtapaUm] = useState<EtapaUmResult | null>(null);
  const [diluicao, setDiluicao] = useState<DiluicaoResult | null>(null);

  function calcular() {
    const r = calcEtapaUm({ tipo, mgFrasco, volReconstituicao, concentracaoAmpola, volAmpola });
    setEtapaUm(r);
    setDiluicao(null);
    setVolDraw(Math.min(volDraw, r.volFinal));
  }

  function calcularDiluicao() {
    if (!etapaUm) return;
    setDiluicao(calcDiluicao(etapaUm.concentracao, volDraw));
  }

  function reset() {
    setEtapaUm(null);
    setDiluicao(null);
  }

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] flex items-center justify-center shrink-0 overflow-hidden">
          <img src="/images/calculadoras/noradrenalina.png" alt="seringa" className="w-full h-full object-contain" />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">Reconstituição e Diluição</p>
          <p className="text-xs text-zinc-400 dark:text-[#5a7a8e]">Cálculo de concentração passo a passo</p>
        </div>
      </div>

      <div className="p-5 space-y-6">

        {/* ── ETAPA 1 ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#3db8d4] text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <p className="text-sm font-bold text-[#0f2d4a] dark:text-[#e8edf5]">Reconstituição</p>
          </div>

          {/* Tipo */}
          <div className="flex gap-2">
            {([["po", "Frasco pó"], ["liquido", "Ampola líquida"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => { setTipo(v); reset(); }}
                className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  tipo === v
                    ? "bg-[#3db8d4]/10 border-[#3db8d4] text-[#0f2d4a] dark:text-[#e8edf5]"
                    : "bg-zinc-50 dark:bg-[#1a2d45] border-zinc-200 dark:border-white/8 text-zinc-600 dark:text-[#c8dce8] hover:border-[#3db8d4]/50"
                }`}>
                {l}
              </button>
            ))}
          </div>

          {tipo === "po" ? (
            <div className="grid grid-cols-2 gap-3">
              <NumInput label="Conteúdo do frasco" sublabel="mg" value={mgFrasco} min={1} max={100000} step={50} onChange={(v) => { setMgFrasco(v); reset(); }} />
              <NumInput label="Volume de reconstituição" sublabel="mL" value={volReconstituicao} min={1} max={100} onChange={(v) => { setVolReconstituicao(v); reset(); }} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <NumInput label="Concentração da ampola" sublabel="mg/mL" value={concentracaoAmpola} min={0.001} max={10000} step={0.1} onChange={(v) => { setConcentracaoAmpola(v); reset(); }} />
              <NumInput label="Volume a utilizar" sublabel="mL" value={volAmpola} min={0.1} max={1000} step={0.1} onChange={(v) => { setVolAmpola(v); reset(); }} />
            </div>
          )}

          <button onClick={calcular}
            className="w-full py-2.5 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] text-white font-bold text-sm transition-colors">
            Calcular reconstituição
          </button>

          {/* Resultado etapa 1 */}
          {etapaUm && (
            <div className="rounded-xl bg-zinc-50 dark:bg-[#0f1e30] border border-zinc-100 dark:border-white/8 px-4 py-3">
              <ResultRow label="Total na solução" value={fmt(etapaUm.totalMg)} />
              <ResultRow label="Concentração" value={fmtConc(etapaUm.concentracao)} />
              <ResultRow label="Volume disponível" value={`${etapaUm.volFinal} mL`} />
            </div>
          )}
        </div>

        {/* ── ETAPA 2 ── */}
        {etapaUm && (
          <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-white/8">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#3db8d4] text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
              <p className="text-sm font-bold text-[#0f2d4a] dark:text-[#e8edf5]">Diluição</p>
            </div>

            <div>
              <NumInput
                label="Volume a retirar da solução"
                sublabel={`mL (máx ${etapaUm.volFinal} mL)`}
                value={volDraw}
                min={0.1}
                max={etapaUm.volFinal}
                step={0.1}
                onChange={(v) => { setVolDraw(Math.min(v, etapaUm.volFinal)); setDiluicao(null); }}
              />
              <p className="text-[11px] text-zinc-400 dark:text-[#3a5a70] mt-1">
                = {fmt(etapaUm.concentracao * volDraw)} de medicamento
              </p>
            </div>

            <p className="text-xs text-zinc-400 dark:text-[#5a7a8e]">Diluir para SF 0,9% ou SG 5%:</p>

            <button onClick={calcularDiluicao}
              className="w-full py-2.5 rounded-xl bg-[#1a6aad] hover:bg-[#155a95] text-white font-bold text-sm transition-colors">
              Calcular diluições
            </button>

            {diluicao && (
              <div className="grid grid-cols-3 gap-2">
                <DiluicaoCard vol={100} conc={diluicao.vol100} totalMg={diluicao.totalMg} />
                <DiluicaoCard vol={250} conc={diluicao.vol250} totalMg={diluicao.totalMg} />
                <DiluicaoCard vol={500} conc={diluicao.vol500} totalMg={diluicao.totalMg} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
