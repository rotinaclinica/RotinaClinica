"use client";

import { useState } from "react";
import { calcularPadua, type PaduaInput, type PaduaResult } from "@/lib/calculadoras/padua";

const COR: Record<PaduaResult["cor"], { badge: string; bar: string }> = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500" },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",               bar: "bg-red-500" },
};

type BoolKey = keyof PaduaInput;

const SECOES: { titulo: string; itens: { campo: BoolKey; label: string; sublabel?: string; pontos: number }[] }[] = [
  {
    titulo: "Fatores de alto peso (3 pontos)",
    itens: [
      { campo: "cancerAtivo",          label: "Câncer em atividade",             sublabel: "Metástase local/remota ou QT/RT nos últimos 6 meses", pontos: 3 },
      { campo: "tevPrevio",            label: "História prévia de TEV",           sublabel: "Excluindo trombose venosa superficial",               pontos: 3 },
      { campo: "mobilidadeReduzida",   label: "Mobilidade reduzida",              sublabel: "≥ 3 dias",                         pontos: 3 },
      { campo: "trombofiliaConhecida", label: "Trombofilia conhecida",                                                                             pontos: 3 },
    ],
  },
  {
    titulo: "Fator de peso intermediário (2 pontos)",
    itens: [
      { campo: "traumaCirurgiaRecente", label: "Trauma ou cirurgia recente", sublabel: "Último mês", pontos: 2 },
    ],
  },
  {
    titulo: "Fatores de baixo peso (1 ponto cada)",
    itens: [
      { campo: "idade70",                    label: "Idade avançada ≥ 70 anos",                          pontos: 1 },
      { campo: "iccOuIr",                    label: "Insuficiência cardíaca e/ou respiratória (DPOC exacerbado, pneumonia grave, insuficiência respiratória aguda de qualquer etiologia pulmonar)", pontos: 1 },
      { campo: "iamOuAvc",                   label: "IAM ou AVC isquêmico recente",                      pontos: 1 },
      { campo: "infeccaoOuReumatologico",    label: "Infecção aguda e/ou doenças reumatológicas",         pontos: 1 },
      { campo: "obesidade",                  label: "Obesidade",                      sublabel: "IMC ≥ 30 kg/m²", pontos: 1 },
      { campo: "hormonioterapia",            label: "Terapia hormonal atual",                             pontos: 1 },
    ],
  },
];

const BOOL_INITIAL: Record<BoolKey, boolean> = {
  cancerAtivo: false, tevPrevio: false, mobilidadeReduzida: false,
  trombofiliaConhecida: false, traumaCirurgiaRecente: false, idade70: false,
  iccOuIr: false, iamOuAvc: false, infeccaoOuReumatologico: false,
  obesidade: false, hormonioterapia: false,
};

export default function PaduaCalc() {
  const [flags, setFlags] = useState<Record<BoolKey, boolean>>(BOOL_INITIAL);
  const [resultado, setResultado] = useState<PaduaResult | null>(null);

  function toggle(campo: BoolKey) {
    setFlags((f) => ({ ...f, [campo]: !f[campo] }));
    setResultado(null);
  }

  function calcular() {
    setResultado(calcularPadua(flags));
  }

  const cor = resultado ? COR[resultado.cor] : null;
  const barWidth = resultado ? Math.min(100, Math.round((resultado.total / 20) * 100)) : 0;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      {/* Cabeçalho */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] overflow-hidden shrink-0">
          <img src="/images/calculadoras/trombo.png" alt="trombose" className="w-full h-full object-contain" />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">Score de Pádua</p>
          <p className="text-xs text-zinc-400 dark:text-[#5a7a8e]">Risco de TEV em pacientes clínicos internados</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {SECOES.map((secao) => (
          <div key={secao.titulo}>
            <p className="text-[11px] font-bold text-zinc-400 dark:text-[#5a7a8e] uppercase tracking-widest mb-2">{secao.titulo}</p>
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
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold leading-snug">{item.label}</p>
                      {item.sublabel && (
                        <p className="text-[11px] text-zinc-500 dark:text-[#8aacbc] mt-0.5">{item.sublabel}</p>
                      )}
                    </div>
                    <span className={`text-xs font-bold shrink-0 ${ativo ? "text-[#3db8d4]" : "text-zinc-400 dark:text-[#3db8d4]/40"}`}>
                      +{item.pontos}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button onClick={calcular}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] text-white font-bold text-sm transition-colors">
          Calcular Score de Pádua
        </button>

        {resultado && cor && (
          <div className="rounded-xl border border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30] p-4 space-y-3">
            <div className="flex items-end gap-2">
              <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">{resultado.total}</p>
              <p className="text-sm text-zinc-400 dark:text-[#5a7a8e] mb-0.5">pontos</p>
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
