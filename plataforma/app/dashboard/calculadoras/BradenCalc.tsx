"use client";

import { useState } from "react";
import { calcularBraden } from "@/lib/calculadoras/braden";

const CRITERIOS: { titulo: string; subtitulo?: string; opcoes: { pts: number; label: string }[] }[] = [
  {
    titulo: "Percepção sensorial",
    opcoes: [
      { pts: 1, label: "Completamente limitada" },
      { pts: 2, label: "Muito limitada" },
      { pts: 3, label: "Levemente limitada" },
      { pts: 4, label: "Sem limitação" },
    ],
  },
  {
    titulo: "Umidade da pele",
    subtitulo: "Exposição à urina, suor ou secreções",
    opcoes: [
      { pts: 1, label: "Constantemente úmida" },
      { pts: 2, label: "Muito úmida" },
      { pts: 3, label: "Ocasionalmente úmida" },
      { pts: 4, label: "Raramente úmida" },
    ],
  },
  {
    titulo: "Atividade",
    opcoes: [
      { pts: 1, label: "Acamado" },
      { pts: 2, label: "Restrito à cadeira" },
      { pts: 3, label: "Anda ocasionalmente" },
      { pts: 4, label: "Anda frequentemente" },
    ],
  },
  {
    titulo: "Mobilidade",
    opcoes: [
      { pts: 1, label: "Completamente imóvel" },
      { pts: 2, label: "Muito limitada" },
      { pts: 3, label: "Levemente limitada" },
      { pts: 4, label: "Sem limitação" },
    ],
  },
  {
    titulo: "Nutrição",
    opcoes: [
      { pts: 1, label: "Muito inadequada" },
      { pts: 2, label: "Inadequada" },
      { pts: 3, label: "Adequada" },
      { pts: 4, label: "Excelente" },
    ],
  },
  {
    titulo: "Fricção e cisalhamento",
    opcoes: [
      { pts: 1, label: "Problemático" },
      { pts: 2, label: "Potencialmente problemático" },
      { pts: 3, label: "Sem problema aparente" },
    ],
  },
];

const COR_MAP = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500", box: "border-emerald-200 dark:border-emerald-700/40 bg-emerald-50 dark:bg-emerald-900/20" },
  amarelo:  { badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",         bar: "bg-amber-500",   box: "border-amber-200 dark:border-amber-700/40 bg-amber-50 dark:bg-amber-900/20"     },
  laranja:  { badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",     bar: "bg-orange-500",  box: "border-orange-200 dark:border-orange-700/40 bg-orange-50 dark:bg-orange-900/20"  },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",                 bar: "bg-red-500",     box: "border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-900/20"             },
};

export default function BradenCalc() {
  const [respostas, setRespostas] = useState<(number | null)[]>([null, null, null, null, null, null]);
  const completo = respostas.every((r) => r !== null);
  const resultado = completo ? calcularBraden(respostas as number[]) : null;
  const cor = resultado ? COR_MAP[resultado.cor] : null;

  function selecionar(idx: number, pts: number) {
    setRespostas((prev) => { const n = [...prev]; n[idx] = pts; return n; });
  }

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8">
        <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">Escala de Braden</p>
        <p className="text-xs text-[#0f2d4a] dark:text-[#5a7a8e] mt-0.5">Risco de lesão por pressão em adultos</p>
      </div>

      <div className="p-5 space-y-5">
        {CRITERIOS.map((c, ci) => (
          <div key={ci}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-bold text-[#0f2d4a] dark:text-[#e8edf5]">{c.titulo}</p>
                {c.subtitulo && <p className="text-[10px] text-[#0f2d4a] dark:text-[#5a7a8e] mt-0.5">{c.subtitulo}</p>}
              </div>
              {respostas[ci] !== null && (
                <span className="text-[11px] font-semibold text-[#3db8d4]">{respostas[ci]} pt</span>
              )}
            </div>
            <div className="space-y-1.5">
              {c.opcoes.map((op) => {
                const ativo = respostas[ci] === op.pts;
                return (
                  <button key={op.pts} type="button"
                    onClick={() => selecionar(ci, op.pts)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-all ${
                      ativo
                        ? "bg-[#e8f4fc] dark:bg-[#1a3a5c] border-[#1a6aad] dark:border-[#3db8d4]"
                        : "border-zinc-200 dark:border-white/8 hover:border-[#3db8d4]/50"
                    }`}>
                    <span className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      ativo ? "border-[#1a6aad] dark:border-[#3db8d4] bg-[#1a6aad] dark:bg-[#3db8d4]" : "border-zinc-300 dark:border-white/20"
                    }`}>
                      {ativo && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span className="flex-1 text-xs text-[#0f2d4a] dark:text-[#c4d4df]">{op.label}</span>
                    <span className={`shrink-0 text-[11px] font-bold ${ativo ? "text-[#1a6aad] dark:text-[#3db8d4]" : "text-[#0f2d4a] dark:text-[#5a7a8e]"}`}>
                      {op.pts}
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

        {resultado && cor && (
          <div className={`rounded-xl border p-4 space-y-3 ${cor.box}`}>
            <p className="text-[11px] font-bold text-[#0f2d4a] dark:text-[#5a7a8e] uppercase tracking-widest">
              Pontuação total
            </p>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">
                {resultado.score}
              </p>
              <p className="text-sm text-[#0f2d4a] dark:text-[#5a7a8e] mb-0.5">/ 23 pontos</p>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-[#1a2d45] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${cor.bar}`}
                style={{ width: `${(resultado.score / 23) * 100}%` }} />
            </div>
            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${cor.badge}`}>
              {resultado.label}
            </span>
            <p className="text-[11px] text-[#0f2d4a] dark:text-[#6a8fa5] leading-relaxed">{resultado.descricao}</p>
          </div>
        )}

        {/* Tabela de referência */}
        <div className="rounded-xl border border-zinc-100 dark:border-white/8 overflow-hidden">
          <p className="text-[11px] font-bold text-[#0f2d4a] dark:text-[#5a7a8e] uppercase tracking-widest px-4 py-2.5 border-b border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30]">
            Classificação de risco
          </p>
          <table className="w-full text-xs">
            <tbody>
              {[
                { faixa: "17 – 23", label: "Risco mínimo",   cor: "verde",    cat: "minimo"   },
                { faixa: "15 – 16", label: "Risco baixo",    cor: "amarelo",  cat: "baixo"    },
                { faixa: "13 – 14", label: "Risco moderado", cor: "laranja",  cat: "moderado" },
                { faixa: "6 – 12",  label: "Risco alto",     cor: "vermelho", cat: "alto"     },
              ].map((linha, i) => {
                const ativo = resultado?.categoria === linha.cat;
                return (
                  <tr key={i} className={`border-b border-zinc-100 dark:border-white/8 last:border-0 transition-colors ${
                    ativo ? COR_MAP[linha.cor as keyof typeof COR_MAP].badge : "hover:bg-zinc-50 dark:hover:bg-white/4"
                  }`}>
                    <td className="px-4 py-2 font-mono text-[#0f2d4a] dark:text-[#9ec4de]">{linha.faixa}</td>
                    <td className={`px-4 py-2 ${ativo ? "font-bold" : "font-medium text-[#0f2d4a] dark:text-[#c4d4df]"}`}>
                      {linha.label}{ativo && <span className="ml-1.5 text-[10px]">◀</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
