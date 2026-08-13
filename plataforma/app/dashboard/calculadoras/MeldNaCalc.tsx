"use client";

import { useState } from "react";
import { calcularMeldNa, type MeldNaInput, type MeldNaResult } from "@/lib/calculadoras/meld-na";

const COR: Record<MeldNaResult["cor"], { badge: string; bar: string }> = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500" },
  amarelo:  { badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",   bar: "bg-yellow-500" },
  laranja:  { badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",   bar: "bg-orange-500" },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",               bar: "bg-red-500" },
};

export default function MeldNaCalc() {
  const [bilirrubina, setBilirrubina] = useState("");
  const [inr, setInr] = useState("");
  const [creatinina, setCreatinina] = useState("");
  const [sodio, setSodio] = useState("");
  const [dialise, setDialise] = useState(false);
  const [resultado, setResultado] = useState<MeldNaResult | null>(null);
  const [erro, setErro] = useState("");

  function calcular() {
    const b = parseFloat(bilirrubina);
    const i = parseFloat(inr);
    const c = parseFloat(creatinina);
    const s = parseFloat(sodio);

    if (isNaN(b) || isNaN(i) || isNaN(c) || isNaN(s)) {
      setErro("Preencha todos os campos para calcular.");
      return;
    }
    setErro("");
    const input: MeldNaInput = { bilirrubina: b, inr: i, creatinina: c, sodio: s, dialise };
    setResultado(calcularMeldNa(input));
  }

  function reset() {
    setResultado(null);
    setErro("");
  }

  const cor = resultado ? COR[resultado.cor] : null;
  const barWidth = resultado ? Math.min(100, Math.round((resultado.meldNa / 40) * 100)) : 0;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] overflow-hidden shrink-0">
          <img src="/images/calculadoras/figado.png" alt="fígado" className="w-full h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">MELD-Na</p>
          <p className="text-xs text-zinc-400 dark:text-[#5a7a8e]">Priorização em transplante hepático</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Bilirrubina total (mg/dL)", value: bilirrubina, set: setBilirrubina, placeholder: "ex: 2,1" },
            { label: "INR",                       value: inr,         set: setInr,         placeholder: "ex: 1,5" },
            { label: "Creatinina (mg/dL)",        value: creatinina,  set: setCreatinina,  placeholder: "ex: 1,2" },
            { label: "Sódio (mEq/L)",             value: sodio,       set: setSodio,       placeholder: "ex: 135" },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label}>
              <label className="text-[11px] text-zinc-500 dark:text-[#8aacbc] mb-1 block">{label}</label>
              <input
                type="number" value={value} placeholder={placeholder}
                onChange={(e) => { set(e.target.value); reset(); }}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#1a2d45] text-sm text-zinc-900 dark:text-[#e8edf5] placeholder:text-zinc-400 dark:placeholder:text-[#4a6a7e] focus:outline-none focus:ring-2 focus:ring-[#3db8d4] focus:border-transparent"
              />
            </div>
          ))}
        </div>

        <button onClick={() => { setDialise((d) => !d); reset(); }}
          className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${
            dialise
              ? "bg-[#3db8d4]/10 border-[#3db8d4] text-[#0f2d4a] dark:text-[#e8edf5]"
              : "bg-zinc-50 dark:bg-[#1a2d45] border-zinc-200 dark:border-white/8 text-zinc-700 dark:text-[#c8dce8] hover:border-[#3db8d4]/50"
          }`}>
          <span className="flex-1 font-semibold">Em diálise</span>
          <span className="text-[11px] text-zinc-400 dark:text-[#5a7a8e]">creatinina → 4,0 mg/dL</span>
        </button>

        {erro && <p className="text-xs text-red-500 dark:text-red-400">{erro}</p>}

        <button onClick={calcular}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] text-white font-bold text-sm transition-colors">
          Calcular MELD-Na
        </button>

        {resultado && cor && (
          <div className="rounded-xl border border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30] p-4 space-y-3">
            <div className="flex items-end gap-4">
              <div>
                <p className="text-[10px] text-zinc-400 dark:text-[#5a7a8e] uppercase tracking-wide mb-0.5">MELD-Na</p>
                <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">{resultado.meldNa}</p>
              </div>
              <div className="mb-1">
                <p className="text-[10px] text-zinc-400 dark:text-[#5a7a8e] uppercase tracking-wide mb-0.5">MELD</p>
                <p className="text-xl font-bold text-zinc-500 dark:text-[#7a9aae] leading-none">{resultado.meld}</p>
              </div>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-[#1a2d45] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${cor.bar}`} style={{ width: `${barWidth}%` }} />
            </div>
            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${cor.badge}`}>{resultado.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
