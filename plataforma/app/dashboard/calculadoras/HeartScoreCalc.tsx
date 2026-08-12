"use client";

import { useState } from "react";
import { calcularHeartScore, type HeartScoreInput, type HeartScoreResult } from "@/lib/calculadoras/heart-score";

type Campo = keyof HeartScoreInput;

const PERGUNTAS: {
  campo: Campo;
  letra: string;
  titulo: string;
  opcoes: { valor: 0 | 1 | 2; label: string; sublabel?: string }[];
}[] = [
  {
    campo: "historia",
    letra: "H",
    titulo: "História",
    opcoes: [
      { valor: 0, label: "Pouco suspeita", sublabel: "Dor atípica, sem características isquêmicas" },
      { valor: 1, label: "Moderadamente suspeita", sublabel: "Combinação de características típicas e atípicas" },
      { valor: 2, label: "Altamente suspeita", sublabel: "Dor típica: opressiva, irradiação, relação com esforço" },
    ],
  },
  {
    campo: "ecg",
    letra: "E",
    titulo: "ECG",
    opcoes: [
      { valor: 0, label: "Normal" },
      { valor: 1, label: "Alteração inespecífica", sublabel: "BRE, HVE, repolarização precoce, ritmo marcapasso" },
      { valor: 2, label: "Desvio ST significativo", sublabel: "Depressão ou elevação de ST não relacionada ao BRE" },
    ],
  },
  {
    campo: "idade",
    letra: "A",
    titulo: "Age (Idade)",
    opcoes: [
      { valor: 0, label: "< 45 anos" },
      { valor: 1, label: "45 – 64 anos" },
      { valor: 2, label: "≥ 65 anos" },
    ],
  },
  {
    campo: "fatoresRisco",
    letra: "R",
    titulo: "Risk factors (Fatores de Risco)",
    opcoes: [
      { valor: 0, label: "Nenhum fator conhecido" },
      { valor: 1, label: "1–2 fatores de risco", sublabel: "Hipertensão, hipercolesterolemia, diabetes, obesidade (IMC >30 kg/m²), tabagismo (atual ou cessação ≤3 meses), histórico familiar positivo precoce (1º grau)" },
      { valor: 2, label: "≥ 3 fatores ou doença aterosclerótica", sublabel: "IAM prévio, CRVM, AVC, DAOP" },
    ],
  },
  {
    campo: "troponina",
    letra: "T",
    titulo: "Troponina",
    opcoes: [
      { valor: 0, label: "≤ limite superior do normal" },
      { valor: 1, label: "1 – 3× o limite normal" },
      { valor: 2, label: "> 3× o limite normal" },
    ],
  },
];

const COR: Record<HeartScoreResult["cor"], { badge: string; bar: string; ring: string }> = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500", ring: "border-emerald-400" },
  amarelo:  { badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",   bar: "bg-yellow-500",  ring: "border-yellow-400" },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",               bar: "bg-red-500",     ring: "border-red-400" },
};

export default function HeartScoreCalc() {
  const [valores, setValores] = useState<Partial<HeartScoreInput>>({});
  const [resultado, setResultado] = useState<HeartScoreResult | null>(null);
  const [erro, setErro] = useState("");

  const totalPreenchido = PERGUNTAS.every((p) => valores[p.campo] !== undefined);

  function calcular() {
    if (!totalPreenchido) {
      setErro("Preencha todos os campos antes de calcular.");
      return;
    }
    setErro("");
    setResultado(calcularHeartScore(valores as HeartScoreInput));
  }

  const cor = resultado ? COR[resultado.cor] : null;
  const barWidth = resultado ? Math.round((resultado.total / 10) * 100) : 0;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      {/* Cabeçalho */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0f1e30] flex items-center justify-center shrink-0 overflow-hidden">
          <img src="/images/calculadoras/coracao.png" alt="coração" className="w-full h-full object-contain" />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">HEART Score</p>
          <p className="text-xs text-zinc-400 dark:text-[#5a7a8e]">Estratificação de risco em dor torácica</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {PERGUNTAS.map((pergunta) => (
          <div key={pergunta.campo}>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-[#6a8fa5] uppercase tracking-wide mb-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[#3db8d4] text-[#0f2d4a] text-xs font-bold mr-1.5 shrink-0">
                {pergunta.letra}
              </span>
              {pergunta.titulo}
            </label>
            <div className="flex flex-col gap-1.5">
              {pergunta.opcoes.map((op) => {
                const selecionado = valores[pergunta.campo] === op.valor;
                return (
                  <button
                    key={op.valor}
                    onClick={() => {
                      setValores((v) => ({ ...v, [pergunta.campo]: op.valor }));
                      setResultado(null);
                      setErro("");
                    }}
                    className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
                      selecionado
                        ? "bg-[#3db8d4]/10 border-[#3db8d4] text-[#0f2d4a] dark:text-[#e8edf5]"
                        : "bg-zinc-50 dark:bg-[#1a2d45] border-zinc-200 dark:border-white/8 text-zinc-600 dark:text-[#8aacbc] hover:border-[#3db8d4]/50"
                    }`}
                  >
                    <span className={`font-bold mr-1.5 ${selecionado ? "text-[#3db8d4]" : "text-zinc-400 dark:text-[#5a7a8e]"}`}>
                      {op.valor}
                    </span>
                    {op.label}
                    {op.sublabel && (
                      <span className="block text-[11px] text-zinc-400 dark:text-[#5a7a8e] mt-0.5 font-normal">
                        {op.sublabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {erro && <p className="text-xs text-red-500 dark:text-red-400">{erro}</p>}

        <button
          onClick={calcular}
          disabled={!totalPreenchido}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors"
        >
          Calcular HEART Score
        </button>

        {resultado && cor && (
          <div className="rounded-xl border border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30] p-4 space-y-3">
            <div className="flex items-end gap-2">
              <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">
                {resultado.total}
              </p>
              <p className="text-sm text-zinc-400 dark:text-[#5a7a8e] mb-0.5">/ 10 pontos</p>
            </div>

            <div className="h-2 w-full bg-zinc-200 dark:bg-[#1a2d45] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${cor.bar}`} style={{ width: `${barWidth}%` }} />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${cor.badge}`}>
                {resultado.label}
              </span>
              <span className="text-xs text-zinc-500 dark:text-[#6a8fa5]">
                MACE em 6 semanas: <strong>{resultado.mace}</strong>
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
