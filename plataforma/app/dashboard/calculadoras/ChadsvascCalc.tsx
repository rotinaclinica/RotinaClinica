"use client";

import { useState } from "react";
import { calcularChadsvasc, type ChadsvascInput, type ChadsvascResult } from "@/lib/calculadoras/chadsvasc";

type FaixaEtaria = "<65" | "65-74" | "75+";

const CRITERIOS = [
  { campo: "insuficienciaCardiaca" as const, sigla: "C",  label: "Insuficiência cardíaca congestiva", sublabel: "" },
  { campo: "hipertensao"           as const, sigla: "H",  label: "Hipertensão arterial",              sublabel: "" },
  { campo: "diabetes"              as const, sigla: "D",  label: "Diabetes mellitus",                 sublabel: "" },
  { campo: "avcOuTia"              as const, sigla: "S₂", label: "AVC, AIT ou tromboembolismo prévio", sublabel: "+2 pontos" },
  { campo: "doencaVascular"        as const, sigla: "V",  label: "Doença vascular",                   sublabel: "IAM prévio, doença arterial periférica ou placa aórtica" },
];

const FAIXAS: { valor: FaixaEtaria; label: string; ajuste: string }[] = [
  { valor: "<65",   label: "< 65 anos",  ajuste: "0"  },
  { valor: "65-74", label: "65–74 anos", ajuste: "+1" },
  { valor: "75+",   label: "≥ 75 anos",  ajuste: "+2" },
];

const INTERPRETACAO = [
  { pontos: "0",  risco: "Muito baixo", conduta: "Anticoagulação não recomendada" },
  { pontos: "1",  risco: "Baixo",       conduta: "Avaliar individualmente" },
  { pontos: "2",  risco: "Moderado",    conduta: "Anticoagulação oral recomendada" },
  { pontos: "3",  risco: "Moderado",    conduta: "Anticoagulação oral recomendada" },
  { pontos: "4",  risco: "Alto",        conduta: "Anticoagulação oral recomendada" },
  { pontos: "5",  risco: "Alto",        conduta: "Anticoagulação oral recomendada" },
  { pontos: "≥6", risco: "Muito alto",  conduta: "Anticoagulação fortemente recomendada" },
];

const COR: Record<ChadsvascResult["cor"], { badge: string; bar: string }> = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500" },
  amarelo:  { badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",   bar: "bg-yellow-500" },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",               bar: "bg-red-500"    },
};

const INITIAL: ChadsvascInput = {
  insuficienciaCardiaca: false, hipertensao: false, idade75: false,
  diabetes: false, avcOuTia: false, doencaVascular: false, idade65a74: false,
};

export default function ChadsvascCalc() {
  const [valores, setValores] = useState<ChadsvascInput>(INITIAL);
  const [faixa, setFaixa] = useState<FaixaEtaria | null>(null);
  const [resultado, setResultado] = useState<ChadsvascResult | null>(null);

  function toggle(campo: keyof Omit<ChadsvascInput, "idade75" | "idade65a74">) {
    setValores((v) => ({ ...v, [campo]: !v[campo] }));
    setResultado(null);
  }

  function selecionarFaixa(f: FaixaEtaria) {
    setFaixa(f);
    setValores((v) => ({ ...v, idade75: f === "75+", idade65a74: f === "65-74" }));
    setResultado(null);
  }

  function calcular() {
    if (!faixa) return;
    setResultado(calcularChadsvasc(valores));
  }

  const cor = resultado ? COR[resultado.cor] : null;
  const barWidth = resultado ? Math.round((resultado.total / resultado.maxPontos) * 100) : 0;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] flex items-center justify-center shrink-0 overflow-hidden">
          <img src="/images/calculadoras/coracao.png" alt="coração" className="w-full h-full object-contain" />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">CHA₂DS₂-VA</p>
          <p className="text-xs text-[#0f2d4a] dark:text-[#5a7a8e]">Risco de AVC em fibrilação atrial</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Faixa etária */}
        <div>
          <p className="text-xs font-semibold text-[#0f2d4a] dark:text-[#6a8fa5] mb-2">
            Idade — critério A / A₂:
          </p>
          <div className="flex gap-2">
            {FAIXAS.map((f) => {
              const ativo = faixa === f.valor;
              return (
                <button
                  key={f.valor}
                  onClick={() => selecionarFaixa(f.valor)}
                  className={`flex-1 px-2 py-2.5 rounded-xl border text-center text-sm font-medium transition-all ${
                    ativo
                      ? "bg-[#3db8d4]/10 border-[#3db8d4] text-[#0f2d4a] dark:text-[#e8edf5]"
                      : "bg-zinc-50 dark:bg-[#1a2d45] border-zinc-200 dark:border-white/8 text-zinc-700 dark:text-[#c8dce8] hover:border-[#3db8d4]/50"
                  }`}
                >
                  <span className="block text-xs">{f.label}</span>
                  <span className={`text-[11px] font-bold ${ativo ? "text-[#3db8d4]" : "text-[#0f2d4a] dark:text-[#3a5a70]"}`}>
                    {f.ajuste}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Critérios binários */}
        <div>
          <p className="text-xs font-semibold text-[#0f2d4a] dark:text-[#6a8fa5] mb-2">
            Critérios clínicos (+1 cada, exceto S₂ = +2):
          </p>
          <div className="space-y-2">
            {CRITERIOS.map((c) => {
              const ativo = valores[c.campo];
              return (
                <button
                  key={c.campo}
                  onClick={() => toggle(c.campo)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                    ativo
                      ? "bg-[#3db8d4]/10 border-[#3db8d4] text-[#0f2d4a] dark:text-[#e8edf5]"
                      : "bg-zinc-50 dark:bg-[#1a2d45] border-zinc-200 dark:border-white/8 text-zinc-700 dark:text-[#c8dce8] hover:border-[#3db8d4]/50"
                  }`}
                >
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold shrink-0 ${
                    ativo ? "bg-[#3db8d4] text-[#0f2d4a]" : "bg-zinc-200 dark:bg-[#3db8d4]/20 text-zinc-500 dark:text-zinc-300"
                  }`}>
                    {c.sigla}
                  </span>
                  <span className="flex-1 min-w-0 font-semibold">{c.label}</span>
                  <span className={`text-xs font-bold shrink-0 ${ativo ? "text-[#3db8d4]" : "text-zinc-300 dark:text-[#3a5a70]"}`}>
                    {ativo ? (c.sigla === "S₂" ? "+2" : "+1") : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={calcular}
          disabled={!faixa}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors"
        >
          Calcular CHA₂DS₂-VA
        </button>

        {resultado && cor && (
          <div className="rounded-xl border border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30] p-4 space-y-3">
            <div className="flex items-end gap-2">
              <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">{resultado.total}</p>
              <p className="text-sm text-[#0f2d4a] dark:text-[#5a7a8e] mb-0.5">/ {resultado.maxPontos} pontos</p>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-[#1a2d45] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${cor.bar}`} style={{ width: `${Math.max(barWidth, 4)}%` }} />
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${cor.badge}`}>
                Risco {resultado.riscoAnual}
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
