"use client";

import { useState } from "react";
import { calcularWellsTvp, type WellsTvpInput, type WellsTvpResult } from "@/lib/calculadoras/wells-tvp";

const COR: Record<WellsTvpResult["cor"], { badge: string; bar: string }> = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500" },
  amarelo:  { badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",       bar: "bg-amber-500" },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",               bar: "bg-red-500" },
};

type BoolKey = keyof WellsTvpInput;

const CRITERIOS: { campo: BoolKey; label: string; sublabel?: string; pontos: number }[] = [
  { campo: "cancer",                label: "Câncer ativo",                                              sublabel: "Em tratamento ou paliação nos últimos 6 meses",                          pontos:  1 },
  { campo: "repousoOuCirurgia",     label: "Acamado > 3 dias ou cirurgia grande recente",              sublabel: "Cirurgia grande nas últimas 12 semanas com anestesia geral/raqui",       pontos:  1 },
  { campo: "edemaPanturrilha",      label: "Edema da panturrilha > 3 cm",                              sublabel: "Comparado ao membro contralateral (10 cm abaixo da tuberosidade tibial)", pontos:  1 },
  { campo: "veicasColaterais",      label: "Veias colaterais superficiais presentes",                  sublabel: "Não varicosas",                                                           pontos:  1 },
  { campo: "edemaTotal",            label: "Edema de todo o membro inferior",                                                                                                              pontos:  1 },
  { campo: "dorVeias",              label: "Dor localizada ao longo das veias profundas",                                                                                                  pontos:  1 },
  { campo: "edemaDepressivel",      label: "Edema depressível confinado ao membro sintomático",                                                                                            pontos:  1 },
  { campo: "paralisiaImobilizacao", label: "Paralisia, paresia ou imobilização recente de MMII",      sublabel: "Gesso ou outra imobilização",                                            pontos:  1 },
  { campo: "tvpPrevia",             label: "TVP previamente documentada",                                                                                                                  pontos:  1 },
  { campo: "diagnosticoAlternativo",label: "Diagnóstico alternativo ao menos tão provável quanto TVP",                                                                                    pontos: -2 },
];

const INITIAL: WellsTvpInput = {
  cancer: false, repousoOuCirurgia: false, edemaPanturrilha: false,
  veicasColaterais: false, edemaTotal: false, dorVeias: false,
  edemaDepressivel: false, paralisiaImobilizacao: false,
  tvpPrevia: false, diagnosticoAlternativo: false,
};

export default function WellsTvpCalc() {
  const [flags, setFlags] = useState<WellsTvpInput>(INITIAL);
  const [resultado, setResultado] = useState<WellsTvpResult | null>(null);

  function toggle(campo: BoolKey) {
    setFlags((f) => ({ ...f, [campo]: !f[campo] }));
    setResultado(null);
  }

  function calcular() {
    setResultado(calcularWellsTvp(flags));
  }

  const cor = resultado ? COR[resultado.cor] : null;
  const barWidth = resultado ? Math.max(0, Math.min(100, Math.round(((resultado.total + 2) / 11) * 100))) : 0;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] overflow-hidden shrink-0">
          <img src="/images/calculadoras/trombo.png" alt="trombose" className="w-full h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">Wells para TVP</p>
          <p className="text-xs text-[#0f2d4a] dark:text-[#5a7a8e]">Probabilidade pré-teste de trombose venosa profunda</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <p className="text-[11px] font-bold text-[#0f2d4a] dark:text-[#5a7a8e] uppercase tracking-widest">Critérios</p>
        <div className="flex flex-col gap-1.5">
          {CRITERIOS.map((item) => {
            const ativo = flags[item.campo];
            const negativo = item.pontos < 0;
            return (
              <button key={item.campo} onClick={() => toggle(item.campo)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                  ativo
                    ? negativo
                      ? "bg-red-50 dark:bg-red-900/20 border-red-400 text-[#0f2d4a] dark:text-[#e8edf5]"
                      : "bg-[#3db8d4]/10 border-[#3db8d4] text-[#0f2d4a] dark:text-[#e8edf5]"
                    : "bg-zinc-50 dark:bg-[#1a2d45] border-zinc-200 dark:border-white/8 text-zinc-700 dark:text-[#c8dce8] hover:border-[#3db8d4]/50"
                }`}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold leading-snug">{item.label}</p>
                  {item.sublabel && (
                    <p className="text-[11px] text-[#0f2d4a] dark:text-[#8aacbc] mt-0.5">{item.sublabel}</p>
                  )}
                </div>
                <span className={`text-xs font-bold shrink-0 ${
                  ativo
                    ? negativo ? "text-red-500" : "text-[#3db8d4]"
                    : "text-zinc-400 dark:text-[#3db8d4]/40"
                }`}>
                  {item.pontos > 0 ? `+${item.pontos}` : item.pontos}
                </span>
              </button>
            );
          })}
        </div>

        <button onClick={calcular}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] text-white font-bold text-sm transition-colors">
          Calcular Wells TVP
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
            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${cor.badge}`}>{resultado.label}</span>
            <p className="text-xs text-zinc-600 dark:text-[#8aacbc] leading-relaxed border-t border-zinc-100 dark:border-white/8 pt-3 whitespace-pre-line">
              {resultado.conduta}
            </p>
            <div className="text-[11px] text-[#0f2d4a] dark:text-[#3a5a70] space-y-0.5 border-t border-zinc-100 dark:border-white/8 pt-3">
              <p><span className="font-semibold">≤ 0</span> — Baixa probabilidade (prevalência 5%)</p>
              <p><span className="font-semibold">1 – 2</span> — Moderada (prevalência 17%)</p>
              <p><span className="font-semibold">≥ 3</span> — Alta probabilidade (prevalência 17–53%)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
