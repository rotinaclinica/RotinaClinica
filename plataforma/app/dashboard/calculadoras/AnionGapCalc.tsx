"use client";

import { useState } from "react";
import { calcularAnionGap } from "@/lib/calculadoras/anion-gap";

const COR_MAP = {
  verde:   { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500" },
  laranja: { badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",     bar: "bg-orange-500" },
};

function Campo({ label, placeholder, value, onChange }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#0f2d4a] dark:text-[#8aacbc] mb-1.5">{label}</label>
      <input type="text" inputMode="decimal" value={value} placeholder={placeholder}
        onChange={(e) => { if (/[^0-9.,]/.test(e.target.value)) return; onChange(e.target.value); }}
        className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-white/8 bg-zinc-50 dark:bg-[#1a2d45] text-sm text-[#0f2d4a] dark:text-[#e8edf5] placeholder-zinc-400 dark:placeholder-[#3a5a70] focus:outline-none focus:border-[#3db8d4]"
      />
    </div>
  );
}

export default function AnionGapCalc() {
  const [na, setNa] = useState("");
  const [cl, setCl] = useState("");
  const [hco3, setHco3] = useState("");
  const [albumina, setAlbumina] = useState("");
  const [resultado, setResultado] = useState<ReturnType<typeof calcularAnionGap> | null>(null);
  const [erro, setErro] = useState("");

  function calcular() {
    const naN = Number(na.replace(",", "."));
    const clN = Number(cl.replace(",", "."));
    const hco3N = Number(hco3.replace(",", "."));
    const albN = albumina ? Number(albumina.replace(",", ".")) : undefined;

    if (!naN || naN < 100 || naN > 200) { setErro("Sódio inválido (ex: 140 mEq/L)."); setResultado(null); return; }
    if (!clN || clN < 60 || clN > 150)  { setErro("Cloro inválido (ex: 104 mEq/L)."); setResultado(null); return; }
    if (!hco3N || hco3N < 5 || hco3N > 45) { setErro("Bicarbonato inválido (ex: 24 mEq/L)."); setResultado(null); return; }
    if (albN !== undefined && (albN < 0.5 || albN > 6)) { setErro("Albumina inválida (ex: 4 g/dL)."); setResultado(null); return; }

    setErro("");
    setResultado(calcularAnionGap(naN, clN, hco3N, albN));
  }

  function reset() {
    setNa(""); setCl(""); setHco3(""); setAlbumina(""); setResultado(null); setErro("");
  }

  const cor = resultado ? COR_MAP[resultado.cor] : null;

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] overflow-hidden shrink-0 flex items-center justify-center">
          <img src="/images/calculadoras/ckd-epi.png" alt="química" className="w-full h-full object-contain scale-[2.0]" />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">Ânion Gap Sérico</p>
          <p className="text-xs text-[#0f2d4a] dark:text-[#5a7a8e] mt-0.5">Na⁺ − (Cl⁻ + HCO₃⁻)</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Campo label="Sódio (mEq/L)"       placeholder="Ex: 140" value={na}    onChange={(v) => { setNa(v);    setResultado(null); }} />
          <Campo label="Cloro (mEq/L)"        placeholder="Ex: 104" value={cl}    onChange={(v) => { setCl(v);    setResultado(null); }} />
          <Campo label="Bicarbonato (mEq/L)"  placeholder="Ex: 24"  value={hco3}  onChange={(v) => { setHco3(v);  setResultado(null); }} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0f2d4a] dark:text-[#8aacbc] mb-1.5">
            Albumina (g/dL) <span className="font-normal text-[#0f2d4a] dark:text-[#5a7a8e]">— opcional, para correção</span>
          </label>
          <input type="text" inputMode="decimal" value={albumina} placeholder="Ex: 4"
            onChange={(e) => { if (/[^0-9.,]/.test(e.target.value)) return; setAlbumina(e.target.value); setResultado(null); }}
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-white/8 bg-zinc-50 dark:bg-[#1a2d45] text-sm text-[#0f2d4a] dark:text-[#e8edf5] placeholder-zinc-400 dark:placeholder-[#3a5a70] focus:outline-none focus:border-[#3db8d4]"
          />
          {albumina && (
            <p className="text-[10px] text-[#0f2d4a] dark:text-[#3a5a70] mt-1">
              AG corrigido = AG + 2,5 × (4,5 − albumina)
            </p>
          )}
        </div>

        {erro && <p className="text-xs text-red-500">{erro}</p>}

        <div className="flex gap-2">
          <button onClick={calcular}
            className="flex-1 py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] text-white font-bold text-sm transition-colors">
            Calcular AG
          </button>
          {resultado && (
            <button onClick={reset}
              className="px-4 py-3 rounded-xl border border-zinc-200 dark:border-white/8 text-xs text-[#0f2d4a] dark:text-[#8aacbc] hover:border-[#3db8d4]/50 transition-colors">
              Limpar
            </button>
          )}
        </div>

        {resultado && cor && (
          <div className="rounded-xl border border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30] p-4 space-y-3">
            <div className="flex items-end gap-4">
              <div>
                <p className="text-[10px] font-semibold text-[#0f2d4a] dark:text-[#5a7a8e] uppercase tracking-wider mb-0.5">AG sérico</p>
                <div className="flex items-end gap-1.5">
                  <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">{resultado.ag}</p>
                  <p className="text-sm text-[#0f2d4a] dark:text-[#5a7a8e] mb-0.5">mEq/L</p>
                </div>
              </div>
              {resultado.agCorrigido != null && (
                <div>
                  <p className="text-[10px] font-semibold text-[#0f2d4a] dark:text-[#5a7a8e] uppercase tracking-wider mb-0.5">AG corrigido</p>
                  <div className="flex items-end gap-1.5">
                    <p className="text-4xl font-extrabold text-[#3db8d4] leading-none">{resultado.agCorrigido.toFixed(1)}</p>
                    <p className="text-sm text-[#0f2d4a] dark:text-[#5a7a8e] mb-0.5">mEq/L</p>
                  </div>
                </div>
              )}
            </div>
            <div>
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${cor.badge}`}>
                {resultado.label}
              </span>
              <p className="text-[11px] text-[#0f2d4a] dark:text-[#6a8fa5] mt-2 leading-relaxed">{resultado.descricao}</p>
            </div>
          </div>
        )}

        {/* Referência */}
        <div className="rounded-xl border border-zinc-100 dark:border-white/8 overflow-hidden">
          <p className="text-[11px] font-bold text-[#0f2d4a] dark:text-[#5a7a8e] uppercase tracking-widest px-4 py-2.5 border-b border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30]">
            Referência
          </p>
          <div className="divide-y divide-zinc-100 dark:divide-white/8">
            {[
              { faixa: "≤ 12",  label: "Normal",  cor: "verde"   },
              { faixa: "> 12",  label: "Elevado", cor: "laranja" },
            ].map((r, i) => {
              const ativo = resultado?.categoria === (r.label === "Normal" ? "normal" : "elevado");
              return (
                <div key={i} className={`flex items-center justify-between px-4 py-2.5 transition-colors ${
                  ativo ? COR_MAP[r.cor as keyof typeof COR_MAP].badge : ""
                }`}>
                  <span className={`text-xs font-mono ${ativo ? "font-bold" : "text-[#0f2d4a] dark:text-[#9ec4de]"}`}>{r.faixa} mEq/L</span>
                  <span className={`text-xs ${ativo ? "font-bold" : "text-[#0f2d4a] dark:text-[#c4d4df]"}`}>
                    {r.label}{ativo && <span className="ml-1.5 text-[10px]">◀</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
