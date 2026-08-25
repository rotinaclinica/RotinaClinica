"use client";

import { useState } from "react";
import { calcularPsiPort, type PsiPortInput, type PsiPortResult, type SexoPSI } from "@/lib/calculadoras/psi-port";

const COR: Record<PsiPortResult["cor"], { badge: string; bar: string }> = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500" },
  amarelo:  { badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",   bar: "bg-yellow-500" },
  laranja:  { badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",   bar: "bg-orange-500" },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",               bar: "bg-red-500" },
};

type BoolKey = Exclude<keyof PsiPortInput, "sexo" | "idade">;

const SECOES: { titulo: string; itens: { campo: BoolKey; label: string; pontos: number; sublabel?: string }[] }[] = [
  {
    titulo: "Dados demográficos",
    itens: [
      { campo: "asilo", label: "Residência em ILPI (asilo)", pontos: 10 },
    ],
  },
  {
    titulo: "Comorbidades",
    itens: [
      { campo: "neoplasia",              label: "Neoplasia",                        pontos: 30 },
      { campo: "hepatopatia",            label: "Doença hepática",                  pontos: 20 },
      { campo: "icc",                    label: "Insuf. cardíaca congestiva",        pontos: 10 },
      { campo: "doencaCerebrovascular",  label: "Doença cérebro-vascular",           pontos: 10 },
      { campo: "doencaRenal",            label: "Doença renal",                      pontos: 10 },
    ],
  },
  {
    titulo: "Exame físico",
    itens: [
      { campo: "sensorioAlterado", label: "Sensório alterado",           pontos: 20 },
      { campo: "fr30",             label: "FR ≥ 30 irpm",                pontos: 20 },
      { campo: "pas90",            label: "PAS < 90 mmHg",               pontos: 20 },
      { campo: "tempAnormal",      label: "Temp. axilar < 35°C ou > 39,9°C", pontos: 15 },
      { campo: "fc125",            label: "FC ≥ 125 bpm",                 pontos: 10 },
    ],
  },
  {
    titulo: "Exames complementares",
    itens: [
      { campo: "phArterial",      label: "pH < 7,35",              pontos: 30 },
      { campo: "ureia78",         label: "BUN ≥ 30 mg/dL (ureia ≥ 64 mg/dL)", pontos: 20 },
      { campo: "sodio130",        label: "Sódio < 130 mEq/L",      pontos: 20 },
      { campo: "glicose250",      label: "Glicose ≥ 250 mg/dL",   pontos: 10 },
      { campo: "hematocrito30",   label: "Hematócrito < 30%",      pontos: 10 },
      { campo: "pao260",          label: "PaO₂ < 60 mmHg",         pontos: 10 },
      { campo: "derrameEleural",  label: "Derrame pleural",         pontos: 10 },
    ],
  },
];

const BOOL_INITIAL: Record<BoolKey, boolean> = {
  asilo: false, neoplasia: false, hepatopatia: false, icc: false,
  doencaCerebrovascular: false, doencaRenal: false, sensorioAlterado: false,
  fr30: false, pas90: false, tempAnormal: false, fc125: false,
  phArterial: false, ureia78: false, sodio130: false, glicose250: false,
  hematocrito30: false, pao260: false, derrameEleural: false,
};

export default function PsiPortCalc() {
  const [sexo, setSexo] = useState<SexoPSI>("M");
  const [idade, setIdade] = useState("");
  const [flags, setFlags] = useState<Record<BoolKey, boolean>>(BOOL_INITIAL);
  const [resultado, setResultado] = useState<PsiPortResult | null>(null);
  const [erro, setErro] = useState("");

  function toggle(campo: BoolKey) {
    setFlags((f) => ({ ...f, [campo]: !f[campo] }));
    setResultado(null);
  }

  function calcular() {
    const id = parseInt(idade, 10);
    if (!idade || isNaN(id) || id < 18 || id > 120) {
      setErro("Informe a idade (18–120 anos).");
      return;
    }
    setErro("");
    setResultado(calcularPsiPort({ sexo, idade: id, ...flags }));
  }

  const cor = resultado ? COR[resultado.cor] : null;
  const barWidth = resultado ? Math.min(100, Math.round((resultado.total / 200) * 100)) : 0;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      {/* Cabeçalho */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#1a5276] flex items-center justify-center shrink-0 overflow-hidden">
          <img src="/images/calculadoras/pulmao.png" alt="pulmão" className="w-full h-full object-contain" />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">PSI/PORT</p>
          <p className="text-xs text-[#0f2d4a] dark:text-[#5a7a8e]">Pneumonia Severity Index</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Sexo + Idade */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#0f2d4a] dark:text-[#6a8fa5] uppercase tracking-wide mb-2">Sexo biológico</label>
            <div className="flex gap-2">
              {(["M", "F"] as SexoPSI[]).map((s) => (
                <button key={s} onClick={() => { setSexo(s); setResultado(null); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    sexo === s
                      ? "bg-[#3db8d4] text-white border-[#3db8d4]"
                      : "bg-zinc-50 dark:bg-[#1a2d45] text-[#0f2d4a] dark:text-[#6a8fa5] border-zinc-200 dark:border-white/8 hover:border-[#3db8d4]/50"
                  }`}>
                  {s === "M" ? "M" : "F"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0f2d4a] dark:text-[#6a8fa5] uppercase tracking-wide mb-2">Idade (anos)</label>
            <input type="number" inputMode="numeric" placeholder="ex: 65" value={idade}
              onChange={(e) => { setIdade(e.target.value); setResultado(null); }}
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0f1e30] text-[#0f2d4a] dark:text-[#e8edf5] placeholder:text-zinc-300 dark:placeholder:text-[#3a5a70] focus:outline-none focus:border-[#3db8d4] transition-colors"
            />
          </div>
        </div>

        {/* Seções de critérios */}
        {SECOES.map((secao) => (
          <div key={secao.titulo}>
            <p className="text-[11px] font-bold text-[#0f2d4a] dark:text-[#5a7a8e] uppercase tracking-widest mb-2">{secao.titulo}</p>
            <div className="flex flex-col gap-1.5">
              {secao.itens.map((item) => {
                const ativo = flags[item.campo];
                return (
                  <button key={item.campo} onClick={() => toggle(item.campo)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                      ativo
                        ? "bg-[#3db8d4]/10 border-[#3db8d4] text-[#0f2d4a] dark:text-[#e8edf5]"
                        : "bg-zinc-50 dark:bg-[#1a2d45] border-zinc-200 dark:border-white/8 text-zinc-700 dark:text-[#c8dce8] hover:border-[#3db8d4]/50"
                    }`}>
                    <span className="flex-1 font-semibold">{item.label}</span>
                    <span className={`text-xs font-bold shrink-0 ${ativo ? "text-[#3db8d4]" : "text-zinc-400 dark:text-[#3db8d4]/40"}`}>
                      +{item.pontos}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {erro && <p className="text-xs text-red-500 dark:text-red-400">{erro}</p>}

        <button onClick={calcular}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] text-white font-bold text-sm transition-colors">
          Calcular PSI/PORT
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${cor.badge}`}>{resultado.label}</span>
              <span className="text-xs text-[#0f2d4a] dark:text-[#6a8fa5]">Mortalidade: <strong>{resultado.mortalidade}</strong></span>
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
