"use client";

import { useState } from "react";
import { calcularQtc, type Sexo } from "@/lib/calculadoras/qtc";

const COR_MAP = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500" },
  amarelo:  { badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",         bar: "bg-amber-500"  },
  laranja:  { badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",     bar: "bg-orange-500" },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",                 bar: "bg-red-500"    },
};

export default function QtcCalc() {
  const [qt, setQt] = useState("");
  const [fc, setFc] = useState("");
  const [sexo, setSexo] = useState<Sexo>("masculino");
  const [modoQt, setModoQt] = useState<"ms" | "caixas">("ms");
  const [resultado, setResultado] = useState<ReturnType<typeof calcularQtc> | null>(null);
  const [erro, setErro] = useState("");

  const qtEmMs = modoQt === "caixas"
    ? (Number(qt.replace(",", ".")) * 40) || 0
    : Number(qt.replace(",", ".")) || 0;

  function calcular() {
    const qtN = qtEmMs;
    const fcN = Number(fc.replace(",", "."));
    if (!qtN || qtN < 200 || qtN > 800) {
      setErro(modoQt === "caixas" ? "Número de caixas inválido (QT deve resultar entre 200 e 800 ms)." : "QT deve estar entre 200 e 800 ms.");
      setResultado(null); return;
    }
    if (!fcN || fcN < 30 || fcN > 250)  { setErro("FC deve estar entre 30 e 250 bpm."); setResultado(null); return; }
    setErro("");
    setResultado(calcularQtc(qtN, fcN, sexo));
  }

  function trocarModo(novo: "ms" | "caixas") {
    setModoQt(novo);
    setQt("");
    setResultado(null);
    setErro("");
  }

  const cor = resultado ? COR_MAP[resultado.cor] : null;
  const barWidth = resultado ? Math.min(100, Math.round((resultado.qtc / 600) * 100)) : 0;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] overflow-hidden shrink-0 flex items-center justify-center">
          <img src="/images/calculadoras/coracao.png" alt="coração" className="w-full h-full object-contain scale-[2.0]" />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">QTc — Fórmula de Bazett</p>
          <p className="text-xs text-[#0f2d4a] dark:text-[#5a7a8e] mt-0.5">Intervalo QT corrigido pela frequência cardíaca</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Sexo */}
        <div>
          <label className="block text-xs font-semibold text-[#0f2d4a] dark:text-[#8aacbc] mb-1.5">Sexo</label>
          <div className="flex gap-2">
            {(["masculino", "feminino"] as Sexo[]).map((s) => (
              <button key={s} type="button"
                onClick={() => { setSexo(s); setResultado(null); }}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all capitalize ${
                  sexo === s
                    ? "bg-[#3db8d4] border-[#3db8d4] text-white"
                    : "border-zinc-200 dark:border-white/8 text-[#0f2d4a] dark:text-[#8aacbc] hover:border-[#3db8d4]/50"
                }`}>
                {s === "masculino" ? "Masculino" : "Feminino"}
              </button>
            ))}
          </div>
        </div>

        {/* QT */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#0f2d4a] dark:text-[#8aacbc]">
              Intervalo QT
            </label>
            <div className="flex rounded-lg border border-zinc-200 dark:border-white/8 overflow-hidden text-[11px] font-semibold">
              {(["ms", "caixas"] as const).map((m) => (
                <button key={m} type="button"
                  onClick={() => trocarModo(m)}
                  className={`px-2.5 py-1 transition-colors ${
                    modoQt === m
                      ? "bg-[#3db8d4] text-white"
                      : "text-[#0f2d4a] dark:text-[#8aacbc] hover:bg-zinc-50 dark:hover:bg-white/4"
                  }`}>
                  {m === "ms" ? "ms" : "caixas"}
                </button>
              ))}
            </div>
          </div>
          <input type="text" inputMode="decimal" value={qt}
            onChange={(e) => { if (/[^0-9.,]/.test(e.target.value)) return; setQt(e.target.value); setResultado(null); }}
            placeholder={modoQt === "ms" ? "Ex: 420" : "Ex: 10,5"}
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-white/8 bg-zinc-50 dark:bg-[#1a2d45] text-sm text-[#0f2d4a] dark:text-[#e8edf5] placeholder-zinc-400 dark:placeholder-[#3a5a70] focus:outline-none focus:border-[#3db8d4]"
          />
          {modoQt === "caixas" && (
            <div className="mt-1.5 flex items-center justify-between">
              <p className="text-[10px] text-[#0f2d4a] dark:text-[#3a5a70]">1 caixa pequena = 40 ms &nbsp;·&nbsp; velocidade padrão 25 mm/s</p>
              {qt && qtEmMs > 0 && (
                <p className="text-[10px] font-semibold text-[#3db8d4]">= {qtEmMs} ms</p>
              )}
            </div>
          )}
        </div>

        {/* FC */}
        <div>
          <label className="block text-xs font-semibold text-[#0f2d4a] dark:text-[#8aacbc] mb-1.5">
            Frequência Cardíaca (bpm)
          </label>
          <input type="text" inputMode="decimal" value={fc}
            onChange={(e) => { if (/[^0-9.,]/.test(e.target.value)) return; setFc(e.target.value); setResultado(null); }}
            placeholder="Ex: 75"
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-white/8 bg-zinc-50 dark:bg-[#1a2d45] text-sm text-[#0f2d4a] dark:text-[#e8edf5] placeholder-zinc-400 dark:placeholder-[#3a5a70] focus:outline-none focus:border-[#3db8d4]"
          />
        </div>

        {erro && <p className="text-xs text-red-500">{erro}</p>}

        <button onClick={calcular}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] text-white font-bold text-sm transition-colors">
          Calcular QTc
        </button>

        {resultado && cor && (
          <div className="rounded-xl border border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30] p-4 space-y-3">
            <div className="flex items-end gap-2">
              <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">
                {Math.round(resultado.qtc)}
              </p>
              <p className="text-sm text-[#0f2d4a] dark:text-[#5a7a8e] mb-0.5">ms</p>
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
            <p className="text-[10px] text-[#0f2d4a] dark:text-[#3a5a70]">
              RR = {resultado.rr.toFixed(3)} s &nbsp;·&nbsp; QTc = {Math.round(resultado.qtc)} ms
            </p>
          </div>
        )}

        {/* Tabela de referência */}
        <div className="rounded-xl border border-zinc-100 dark:border-white/8 overflow-hidden">
          <p className="text-[11px] font-bold text-[#0f2d4a] dark:text-[#5a7a8e] uppercase tracking-widest px-4 py-2.5 border-b border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30]">
            Valores de referência
          </p>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-zinc-50 dark:bg-[#0f1e30] border-b border-zinc-100 dark:border-white/8">
                <th className="text-left px-4 py-2 font-semibold text-[#0f2d4a] dark:text-[#8aacbc]">QTc (ms)</th>
                <th className="text-left px-4 py-2 font-semibold text-[#0f2d4a] dark:text-[#8aacbc]">Homem</th>
                <th className="text-left px-4 py-2 font-semibold text-[#0f2d4a] dark:text-[#8aacbc]">Mulher</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Normal",     homem: "< 460",    mulher: "< 470",    cor: "verde",    cat: "normal"    },
                { label: "Limítrofe",  homem: "460–469",  mulher: "470–479",  cor: "amarelo",  cat: "limítrofe" },
                { label: "Prolongado", homem: "≥ 470",    mulher: "≥ 480",    cor: "laranja",  cat: "prolongado"},
                { label: "Alto risco", homem: "> 500",    mulher: "> 500",    cor: "vermelho", cat: "critico"   },
              ].map((linha, i) => {
                const ativo = resultado?.categoria === linha.cat;
                return (
                  <tr key={i} className={`border-b border-zinc-100 dark:border-white/8 last:border-0 transition-colors ${
                    ativo ? COR_MAP[linha.cor as keyof typeof COR_MAP].badge : "hover:bg-zinc-50 dark:hover:bg-white/4"
                  }`}>
                    <td className={`px-4 py-2 ${ativo ? "font-bold" : "font-medium text-[#0f2d4a] dark:text-[#c4d4df]"}`}>
                      {linha.label}{ativo && <span className="ml-1.5 text-[10px]">◀</span>}
                    </td>
                    <td className="px-4 py-2 font-mono text-[#0f2d4a] dark:text-[#9ec4de]">{linha.homem}</td>
                    <td className="px-4 py-2 font-mono text-[#0f2d4a] dark:text-[#9ec4de]">{linha.mulher}</td>
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
