"use client";

import { useState } from "react";
import {
  calcularGlasgow, type GlasgowInput, type GlasgowResult, type GCSValor,
  OCULAR_OPTIONS, VERBAL_OPTIONS, MOTOR_OPTIONS,
} from "@/lib/calculadoras/glasgow";

const COR: Record<GlasgowResult["cor"], { badge: string; bar: string }> = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500" },
  amarelo:  { badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",   bar: "bg-yellow-500" },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",               bar: "bg-red-500" },
  zinc:     { badge: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",              bar: "bg-zinc-400" },
};

const SECOES = [
  { key: "ocular" as const, titulo: "Abertura Ocular (E)", options: OCULAR_OPTIONS, max: 4 },
  { key: "verbal" as const, titulo: "Resposta Verbal (V)", options: VERBAL_OPTIONS, max: 5 },
  { key: "motor"  as const, titulo: "Melhor Resposta Motora (M)", options: MOTOR_OPTIONS, max: 6 },
];

export default function GlasgowCalc() {
  const [valores, setValores] = useState<GlasgowInput>({ ocular: null, verbal: null, motor: null });
  const [resultado, setResultado] = useState<GlasgowResult | null>(null);
  const [erro, setErro] = useState("");

  function selecionar(key: keyof GlasgowInput, val: GCSValor) {
    setValores((v) => ({ ...v, [key]: val }));
    setResultado(null);
  }

  function calcular() {
    if (valores.ocular === null && valores.verbal === null && valores.motor === null) {
      setErro("Selecione ao menos um componente.");
      return;
    }
    setErro("");
    setResultado(calcularGlasgow(valores));
  }

  const cor = resultado ? COR[resultado.cor] : null;
  const total = resultado?.total ?? null;
  const barWidth = total !== null ? Math.round(((total - 3) / 12) * 100) : 0;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      {/* Cabeçalho */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] overflow-hidden shrink-0">
          <img src="/images/calculadoras/cerebro.png" alt="cérebro" className="w-full h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">Escala de Coma de Glasgow</p>
          <p className="text-xs text-[#0f2d4a] dark:text-[#5a7a8e]">Nível de consciência — E + V + M</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {SECOES.map((secao) => (
          <div key={secao.key}>
            <p className="text-[11px] font-bold text-[#0f2d4a] dark:text-[#5a7a8e] uppercase tracking-widest mb-2">
              {secao.titulo}
            </p>
            <div className="flex flex-col gap-1.5">
              {secao.options.map((opt) => {
                const ativo = valores[secao.key] === opt.valor;
                const isNT = opt.valor === null;
                return (
                  <button key={String(opt.valor)} onClick={() => selecionar(secao.key, opt.valor)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                      ativo
                        ? isNT
                          ? "bg-zinc-100 dark:bg-zinc-800/60 border-zinc-400 dark:border-zinc-500 text-zinc-700 dark:text-zinc-300"
                          : "bg-[#3db8d4]/10 border-[#3db8d4] text-[#0f2d4a] dark:text-[#e8edf5]"
                        : "bg-zinc-50 dark:bg-[#1a2d45] border-zinc-200 dark:border-white/8 text-zinc-700 dark:text-[#c8dce8] hover:border-[#3db8d4]/50"
                    }`}>
                    <span className="flex-1 font-semibold">{opt.label}</span>
                    <span className={`text-xs font-bold shrink-0 ${
                      ativo
                        ? isNT ? "text-zinc-500 dark:text-zinc-400" : "text-[#3db8d4]"
                        : "text-zinc-400 dark:text-[#3db8d4]/40"
                    }`}>
                      {opt.valor !== null ? `+${opt.valor}` : "NT"}
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
          Calcular Glasgow
        </button>

        {resultado && cor && (
          <div className="rounded-xl border border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30] p-4 space-y-3">
            <div className="flex items-end gap-2">
              <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">
                {total !== null ? total : "NT"}
              </p>
              <p className="text-sm text-[#0f2d4a] dark:text-[#5a7a8e] mb-0.5">pontos</p>
              <p className="text-xs text-[#0f2d4a] dark:text-[#5a7a8e] mb-0.5 ml-1">({resultado.label_score})</p>
            </div>
            {total !== null && (
              <div className="h-2 w-full bg-zinc-200 dark:bg-[#1a2d45] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${cor.bar}`} style={{ width: `${barWidth}%` }} />
              </div>
            )}
            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${cor.badge}`}>{resultado.label}</span>
            {resultado.conduta && (
              <p className="text-xs text-zinc-600 dark:text-[#8aacbc] leading-relaxed border-t border-zinc-100 dark:border-white/8 pt-3">
                {resultado.conduta}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
