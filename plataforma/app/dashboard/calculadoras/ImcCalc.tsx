"use client";

import { useState } from "react";
import { calcularImc, IMC_TABELA, type ImcResult } from "@/lib/calculadoras/imc";

const COR: Record<ImcResult["cor"], { badge: string; bar: string }> = {
  "azul":           { badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",             bar: "bg-blue-400"    },
  "verde":          { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500" },
  "amarelo":        { badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",         bar: "bg-amber-500"   },
  "laranja":        { badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",     bar: "bg-orange-500"  },
  "vermelho":       { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",                 bar: "bg-red-500"     },
  "vermelho-escuro":{ badge: "bg-rose-200 text-rose-900 dark:bg-rose-900/50 dark:text-rose-300",             bar: "bg-rose-700"    },
};

const COR_TABELA: Record<string, string> = {
  "azul":            "bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300",
  "verde":           "bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300",
  "amarelo":         "bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-300",
  "laranja":         "bg-orange-50 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300",
  "vermelho":        "bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-300",
  "vermelho-escuro": "bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-300",
};

export default function ImcCalc() {
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [unidadeAltura, setUnidadeAltura] = useState<"cm" | "m">("cm");
  const [resultado, setResultado] = useState<ImcResult | null>(null);
  const [erro, setErro] = useState("");

  function calcular() {
    const p = Number(peso.replace(",", "."));
    const a = Number(altura.replace(",", "."));
    const alturaEmCm = unidadeAltura === "m" ? a * 100 : a;
    if (!p || !a || p <= 0 || alturaEmCm <= 0 || alturaEmCm > 300) {
      setErro("Preencha peso e altura com valores válidos.");
      setResultado(null);
      return;
    }
    setErro("");
    setResultado(calcularImc({ peso: p, altura: alturaEmCm }));
  }

  const cor = resultado ? COR[resultado.cor] : null;
  const barWidth = resultado ? Math.min(100, Math.max(0, Math.round(((resultado.imc - 10) / 40) * 100))) : 0;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] overflow-hidden shrink-0">
          <img src="/images/calculadoras/imc.png" alt="IMC" className="w-full h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">Calculadora de IMC</p>
          <p className="text-xs text-zinc-400 dark:text-[#5a7a8e]">Classificação nutricional baseada no peso e altura</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-[#8aacbc] mb-1.5">Peso (kg)</label>
            <input
              type="text" inputMode="decimal" value={peso}
              onChange={(e) => {
                const val = e.target.value;
                if (/[^0-9.,]/.test(val)) return;
                setPeso(val);
                setResultado(null);
              }}
              placeholder="Ex: 70 ou 70,50"
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-white/8 bg-zinc-50 dark:bg-[#1a2d45] text-sm text-[#0f2d4a] dark:text-[#e8edf5] placeholder-zinc-400 dark:placeholder-[#3a5a70] focus:outline-none focus:border-[#3db8d4]"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-[#8aacbc]">Altura</label>
              <div className="flex rounded-lg overflow-hidden border border-zinc-200 dark:border-white/8 text-[11px] font-bold">
                {(["cm", "m"] as const).map((u) => (
                  <button key={u} type="button"
                    onClick={() => { setUnidadeAltura(u); setAltura(""); setResultado(null); }}
                    className={`px-2.5 py-1 transition-colors ${
                      unidadeAltura === u
                        ? "bg-[#3db8d4] text-white"
                        : "bg-zinc-50 dark:bg-[#1a2d45] text-zinc-400 dark:text-[#5a7a8e] hover:bg-zinc-100 dark:hover:bg-[#1e3450]"
                    }`}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <input
              type={unidadeAltura === "cm" ? "number" : "text"}
              inputMode="decimal"
              min={unidadeAltura === "cm" ? 50 : undefined}
              max={unidadeAltura === "cm" ? 300 : undefined}
              step={unidadeAltura === "cm" ? 1 : undefined}
              value={altura}
              onChange={(e) => {
                const val = e.target.value;
                if (unidadeAltura === "m" && /[^0-9.,]/.test(val)) return;
                setAltura(val);
                setResultado(null);
              }}
              placeholder={unidadeAltura === "cm" ? "Ex: 170" : "Ex: 1.70 ou 1,70"}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-white/8 bg-zinc-50 dark:bg-[#1a2d45] text-sm text-[#0f2d4a] dark:text-[#e8edf5] placeholder-zinc-400 dark:placeholder-[#3a5a70] focus:outline-none focus:border-[#3db8d4]"
            />
          </div>
        </div>

        {erro && <p className="text-xs text-red-500">{erro}</p>}

        <button onClick={calcular}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] text-white font-bold text-sm transition-colors">
          Calcular IMC
        </button>

        {resultado && cor && (
          <div className="rounded-xl border border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30] p-4 space-y-3">
            <div className="flex items-end gap-2">
              <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">
                {resultado.imc.toFixed(1)}
              </p>
              <p className="text-sm text-zinc-400 dark:text-[#5a7a8e] mb-0.5">kg/m²</p>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-[#1a2d45] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${cor.bar}`} style={{ width: `${barWidth}%` }} />
            </div>
            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${cor.badge}`}>{resultado.label}</span>
          </div>
        )}

        {/* Tabela de referência */}
        <div className="rounded-xl border border-zinc-100 dark:border-white/8 overflow-hidden">
          <p className="text-[11px] font-bold text-zinc-400 dark:text-[#5a7a8e] uppercase tracking-widest px-4 py-2.5 border-b border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30]">
            Classificação ASMBS
          </p>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-zinc-50 dark:bg-[#0f1e30] border-b border-zinc-100 dark:border-white/8">
                <th className="text-left px-4 py-2 font-semibold text-zinc-500 dark:text-[#8aacbc]">Faixa de IMC (kg/m²)</th>
                <th className="text-left px-4 py-2 font-semibold text-zinc-500 dark:text-[#8aacbc]">Categoria</th>
              </tr>
            </thead>
            <tbody>
              {IMC_TABELA.map((linha, i) => {
                const ativo = resultado?.label === linha.label;
                return (
                  <tr key={i}
                    className={`border-b border-zinc-100 dark:border-white/8 last:border-0 transition-colors ${
                      ativo ? COR_TABELA[linha.cor] : "hover:bg-zinc-50 dark:hover:bg-white/4"
                    }`}>
                    <td className="px-4 py-2 font-mono text-zinc-600 dark:text-[#9ec4de]">{linha.faixa}</td>
                    <td className={`px-4 py-2 ${ativo ? "font-bold" : "font-medium text-zinc-700 dark:text-[#c4d4df]"}`}>
                      {linha.label}
                      {ativo && <span className="ml-2 text-[10px]">◀</span>}
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
