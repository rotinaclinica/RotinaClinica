"use client";

import { useState } from "react";
import { calcularQuatroTs } from "@/lib/calculadoras/4ts";

const CRITERIOS = [
  {
    titulo: "Trombocitopenia",
    opcoes: [
      { pts: 2, label: "Queda >50% E nadir ≥20.000/mm³" },
      { pts: 1, label: "Queda 30–50% OU nadir 10.000–19.000/mm³" },
      { pts: 0, label: "Queda <30% OU nadir <10.000/mm³" },
    ],
  },
  {
    titulo: "Momento da queda plaquetária",
    opcoes: [
      { pts: 2, label: "Início claro entre dias 5–10 OU queda ≤1 dia (heparina prévia nos últimos 30 dias)" },
      { pts: 1, label: "Consistente com dias 5–10, mas sem certeza OU início após dia 10 OU queda ≤1 dia (heparina prévia há 30–100 dias)" },
      { pts: 0, label: "Queda <4 dias sem exposição recente à heparina" },
    ],
  },
  {
    titulo: "Trombose ou outras sequelas",
    opcoes: [
      { pts: 2, label: "Nova trombose confirmada OU necrose cutânea no local de injeção OU reação sistêmica aguda após bolus IV de heparina" },
      { pts: 1, label: "Trombose progressiva/recorrente OU lesões cutâneas eritematosas não necróticas OU trombose suspeitada (não confirmada)" },
      { pts: 0, label: "Nenhuma" },
    ],
  },
  {
    titulo: "Outras causas de trombocitopenia",
    opcoes: [
      { pts: 2, label: "Nenhuma causa alternativa aparente" },
      { pts: 1, label: "Causa alternativa possível" },
      { pts: 0, label: "Causa alternativa definida" },
    ],
  },
];

const COR_MAP = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500", box: "border-emerald-200 dark:border-emerald-700/40 bg-emerald-50 dark:bg-emerald-900/20" },
  amarelo:  { badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",         bar: "bg-amber-500",   box: "border-amber-200 dark:border-amber-700/40 bg-amber-50 dark:bg-amber-900/20"     },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",                 bar: "bg-red-500",     box: "border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-900/20"             },
};

const CONDUTAS: Record<string, { titulo: string; heparina: string; heparinaOk: boolean; substituto?: string }> = {
  baixa: {
    titulo: "TIH extremamente improvável",
    heparina: "Pode continuar ou reiniciar a heparina se indicado",
    heparinaOk: true,
  },
  intermediaria: {
    titulo: "TIH possível",
    heparina: "Suspender todos os produtos com heparina",
    heparinaOk: false,
    substituto: "Substituir por anticoagulante não heparínico",
  },
  alta: {
    titulo: "TIH provável",
    heparina: "Suspender imediatamente todos os produtos com heparina",
    heparinaOk: false,
    substituto: "Substituir por anticoagulante não heparínico",
  },
};

export default function QuatroTsCalc() {
  const [respostas, setRespostas] = useState<(number | null)[]>([null, null, null, null]);
  const completo = respostas.every((r) => r !== null);
  const resultado = completo ? calcularQuatroTs(respostas as number[]) : null;
  const cor = resultado ? COR_MAP[resultado.cor] : null;
  const conduta = resultado ? CONDUTAS[resultado.probabilidade] : null;

  function selecionar(criterioIdx: number, pts: number) {
    setRespostas((prev) => {
      const novo = [...prev];
      novo[criterioIdx] = pts;
      return novo;
    });
  }

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8">
        <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">Score 4Ts — TIH</p>
        <p className="text-xs text-[#0f2d4a] dark:text-[#5a7a8e] mt-0.5">
          Probabilidade de Trombocitopenia Induzida por Heparina
        </p>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex gap-2 items-start px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#0f1e30] border border-zinc-100 dark:border-white/8 text-xs text-[#0f2d4a] dark:text-[#6a8fa5] leading-relaxed">
          <span className="shrink-0 text-[#3db8d4] font-bold">i</span>
          <span><span className="font-semibold">Nadir</span> = valor mínimo de plaquetas atingido após o início da heparina. Para a queda percentual, compare com o valor basal antes da queda relacionada à heparina.</span>
        </div>

        {CRITERIOS.map((c, ci) => (
          <div key={ci}>
            <p className="text-xs font-bold text-[#0f2d4a] dark:text-[#e8edf5] mb-2">{c.titulo}</p>
            <div className="space-y-2">
              {c.opcoes.map((op) => {
                const ativo = respostas[ci] === op.pts;
                return (
                  <button key={op.pts} type="button"
                    onClick={() => selecionar(ci, op.pts)}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                      ativo
                        ? "bg-[#e8f4fc] dark:bg-[#1a3a5c] border-[#1a6aad] dark:border-[#3db8d4]"
                        : "border-zinc-200 dark:border-white/8 hover:border-[#3db8d4]/50"
                    }`}>
                    <span className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${
                      ativo ? "border-[#1a6aad] dark:border-[#3db8d4] bg-[#1a6aad] dark:bg-[#3db8d4]" : "border-zinc-300 dark:border-white/20"
                    }`}>
                      {ativo && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    <span className="flex-1 text-xs text-[#0f2d4a] dark:text-[#c4d4df] leading-relaxed">{op.label}</span>
                    <span className={`shrink-0 text-xs font-bold ${ativo ? "text-[#1a6aad] dark:text-[#3db8d4]" : "text-[#0f2d4a] dark:text-[#5a7a8e]"}`}>
                      +{op.pts}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {!completo && (
          <p className="text-[11px] text-[#0f2d4a] dark:text-[#5a7a8e] text-center">
            Selecione uma opção para cada critério
          </p>
        )}

        {resultado && cor && conduta && (
          <div className="space-y-3">
            {/* Score */}
            <div className={`rounded-xl border p-4 ${cor.box}`}>
              <p className="text-[11px] font-bold text-[#0f2d4a] dark:text-[#5a7a8e] uppercase tracking-widest mb-2">
                Pontuação total
              </p>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">
                  {resultado.score}
                </p>
                <p className="text-sm text-[#0f2d4a] dark:text-[#5a7a8e] mb-0.5">/ 8 pontos</p>
              </div>
              <div className="h-2 w-full bg-zinc-200 dark:bg-[#1a2d45] rounded-full overflow-hidden mb-3">
                <div className={`h-full rounded-full transition-all duration-500 ${cor.bar}`}
                  style={{ width: `${(resultado.score / 8) * 100}%` }} />
              </div>
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${cor.badge}`}>
                {resultado.label}
              </span>
              <span className="ml-2 text-xs text-[#0f2d4a] dark:text-[#6a8fa5]">
                VPP {resultado.ppv}
              </span>
            </div>

            {/* Conduta */}
            <div className="rounded-xl border border-zinc-100 dark:border-white/8 overflow-hidden">
              <div className="px-4 py-2.5 bg-zinc-100 dark:bg-[#0f1e30] border-b border-zinc-200 dark:border-white/8">
                <p className="text-[11px] font-bold text-[#0f2d4a] dark:text-[#5a7a8e] uppercase tracking-widest">Conduta</p>
              </div>
              <div className="p-4 space-y-2.5 bg-white dark:bg-[#131c2e]">
                <p className="text-sm font-bold text-[#0f2d4a] dark:text-[#e8edf5]">{conduta.titulo}</p>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium ${
                  conduta.heparinaOk
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/40"
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700/40"
                }`}>
                  <span className="text-base shrink-0">{conduta.heparinaOk ? "✓" : "✕"}</span>
                  <span>{conduta.heparina}</span>
                </div>
                {conduta.substituto && (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/40">
                    <span className="text-base shrink-0">→</span>
                    <span>{conduta.substituto}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
