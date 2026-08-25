"use client";

import { useState } from "react";
import { calcularPfRatio } from "@/lib/calculadoras/pf-ratio";

const COR_MAP = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500" },
  amarelo:  { badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",         bar: "bg-amber-500"  },
  laranja:  { badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",     bar: "bg-orange-500" },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",                 bar: "bg-red-500"    },
};

const FIO2_RAPIDOS = [
  { label: "Ar ambiente",    sub: "21%",  value: "21"  },
  { label: "CN 1 L/min",    sub: "25%",  value: "25"  },
  { label: "CN 2 L/min",    sub: "29%",  value: "29"  },
  { label: "CN 3 L/min",    sub: "33%",  value: "33"  },
  { label: "CN 4 L/min",    sub: "37%",  value: "37"  },
  { label: "CN 5 L/min",    sub: "41%",  value: "41"  },
  { label: "CN 6 L/min",    sub: "45%",  value: "45"  },
  { label: "Másc. simples",  sub: "~50%", value: "50"  },
  { label: "Másc. NR",      sub: "~80%", value: "80"  },
  { label: "VM / CNAF",     sub: "100%", value: "100" },
];

export default function PfRatioCalc() {
  const [pao2, setPao2] = useState("");
  const [fio2, setFio2] = useState("");
  const [resultado, setResultado] = useState<ReturnType<typeof calcularPfRatio> | null>(null);
  const [erro, setErro] = useState("");

  function calcular() {
    const p = Number(pao2.replace(",", "."));
    const f = Number(fio2.replace(",", "."));
    if (!p || p <= 0 || p > 700) { setErro("PaO₂ inválida (ex: 80 mmHg)."); setResultado(null); return; }
    if (!f || f < 21 || f > 100)  { setErro("FiO₂ deve estar entre 21 e 100%."); setResultado(null); return; }
    setErro("");
    setResultado(calcularPfRatio(p, f));
  }

  function selecionarFio2(val: string) {
    setFio2(val);
    setResultado(null);
  }

  const cor = resultado ? COR_MAP[resultado.cor] : null;
  const barWidth = resultado ? Math.min(100, Math.round((resultado.pf / 400) * 100)) : 0;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] overflow-hidden shrink-0 flex items-center justify-center">
          <img src="/images/calculadoras/pulmao.png" alt="pulmão" className="w-full h-full object-contain scale-[2.0]" />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">Relação P/F (Horowitz)</p>
          <p className="text-xs text-[#0f2d4a] dark:text-[#5a7a8e] mt-0.5">Classificação de SDRA — Critério de Berlim</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* PaO2 */}
        <div>
          <label className="block text-xs font-semibold text-[#0f2d4a] dark:text-[#8aacbc] mb-1.5">
            PaO₂ (mmHg)
          </label>
          <input type="text" inputMode="decimal" value={pao2}
            onChange={(e) => { if (/[^0-9.,]/.test(e.target.value)) return; setPao2(e.target.value); setResultado(null); }}
            placeholder="Ex: 80"
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-white/8 bg-zinc-50 dark:bg-[#1a2d45] text-sm text-[#0f2d4a] dark:text-[#e8edf5] placeholder-zinc-400 dark:placeholder-[#3a5a70] focus:outline-none focus:border-[#3db8d4]"
          />
        </div>

        {/* FiO2 */}
        <div>
          <label className="block text-xs font-semibold text-[#0f2d4a] dark:text-[#8aacbc] mb-1.5">
            FiO₂ (%)
          </label>
          <input type="text" inputMode="decimal" value={fio2}
            onChange={(e) => { if (/[^0-9.,]/.test(e.target.value)) return; setFio2(e.target.value); setResultado(null); }}
            placeholder="Ex: 40"
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-white/8 bg-zinc-50 dark:bg-[#1a2d45] text-sm text-[#0f2d4a] dark:text-[#e8edf5] placeholder-zinc-400 dark:placeholder-[#3a5a70] focus:outline-none focus:border-[#3db8d4] mb-2"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {FIO2_RAPIDOS.map((f) => (
              <button key={f.value} type="button"
                onClick={() => selecionarFio2(f.value)}
                className={`px-2.5 py-2 rounded-lg border text-left transition-all ${
                  fio2 === f.value
                    ? "bg-[#3db8d4] border-[#3db8d4] text-white"
                    : "border-zinc-200 dark:border-white/8 hover:border-[#3db8d4]/50"
                }`}>
                <span className={`block text-[11px] font-semibold leading-tight ${fio2 === f.value ? "text-white" : "text-[#0f2d4a] dark:text-[#8aacbc]"}`}>{f.label}</span>
                <span className={`block text-[10px] leading-tight mt-0.5 ${fio2 === f.value ? "text-white/80" : "text-[#0f2d4a] dark:text-[#5a7a8e]"}`}>{f.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {erro && <p className="text-xs text-red-500">{erro}</p>}

        <button onClick={calcular}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] text-white font-bold text-sm transition-colors">
          Calcular P/F
        </button>

        {resultado && cor && (
          <div className="rounded-xl border border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30] p-4 space-y-3">
            <div className="flex items-end gap-2">
              <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">
                {Math.round(resultado.pf)}
              </p>
              <p className="text-sm text-[#0f2d4a] dark:text-[#5a7a8e] mb-0.5">mmHg</p>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-[#1a2d45] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${cor.bar}`} style={{ width: `${barWidth}%` }} />
            </div>
            <div>
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${cor.badge}`}>
                {resultado.label}
              </span>
              <p className="text-[11px] text-[#0f2d4a] dark:text-[#6a8fa5] mt-2 leading-relaxed">{resultado.descricao}</p>
            </div>
          </div>
        )}

        {/* Tabela de referência */}
        <div className="rounded-xl border border-zinc-100 dark:border-white/8 overflow-hidden">
          <p className="text-[11px] font-bold text-[#0f2d4a] dark:text-[#5a7a8e] uppercase tracking-widest px-4 py-2.5 border-b border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30]">
            Critério de Berlim — SDRA
          </p>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-zinc-50 dark:bg-[#0f1e30] border-b border-zinc-100 dark:border-white/8">
                <th className="text-left px-4 py-2 font-semibold text-[#0f2d4a] dark:text-[#8aacbc]">P/F (mmHg)</th>
                <th className="text-left px-4 py-2 font-semibold text-[#0f2d4a] dark:text-[#8aacbc]">Categoria</th>
                <th className="text-right px-4 py-2 font-semibold text-[#0f2d4a] dark:text-[#8aacbc]">Mortalidade</th>
              </tr>
            </thead>
            <tbody>
              {[
                { faixa: "> 300",     categoria: "normal",   label: "Sem SDRA",      mortalidade: "—",   cor: "verde"    },
                { faixa: "200 – 300", categoria: "leve",     label: "SDRA Leve",     mortalidade: "27%", cor: "amarelo"  },
                { faixa: "100 – 200", categoria: "moderada", label: "SDRA Moderada", mortalidade: "32%", cor: "laranja"  },
                { faixa: "≤ 100",     categoria: "grave",    label: "SDRA Grave",    mortalidade: "45%", cor: "vermelho" },
              ].map((linha, i) => {
                const ativo = resultado?.categoria === linha.categoria;
                return (
                  <tr key={i} className={`border-b border-zinc-100 dark:border-white/8 last:border-0 transition-colors ${
                    ativo ? COR_MAP[linha.cor as keyof typeof COR_MAP].badge : "hover:bg-zinc-50 dark:hover:bg-white/4"
                  }`}>
                    <td className="px-4 py-2 font-mono text-[#0f2d4a] dark:text-[#9ec4de]">{linha.faixa}</td>
                    <td className={`px-4 py-2 ${ativo ? "font-bold" : "font-medium text-[#0f2d4a] dark:text-[#c4d4df]"}`}>
                      {linha.label}{ativo && <span className="ml-2 text-[10px]">◀</span>}
                    </td>
                    <td className={`px-4 py-2 text-right font-mono ${ativo ? "font-bold" : "text-[#0f2d4a] dark:text-[#6a8fa5]"}`}>
                      {linha.mortalidade}
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
