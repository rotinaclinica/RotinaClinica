"use client";

import { useState } from "react";
import { calcularAguaLivre, getTbwFracao, type Sexo, type FaixaEtaria } from "@/lib/calculadoras/agua-livre";

const SEXOS: { value: Sexo; label: string }[] = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino",  label: "Feminino"  },
];

const FAIXAS: { value: FaixaEtaria; label: string }[] = [
  { value: "crianca", label: "Criança" },
  { value: "adulto",  label: "Adulto"  },
  { value: "idoso",   label: "Idoso"   },
];

export default function AguaLivreCalc() {
  const [sexo, setSexo] = useState<Sexo>("masculino");
  const [faixa, setFaixa] = useState<FaixaEtaria>("adulto");
  const [peso, setPeso] = useState("");
  const [sodioAtual, setSodioAtual] = useState("");
  const [sodioDesejado, setSodioDesejado] = useState("140");
  const [resultado, setResultado] = useState<ReturnType<typeof calcularAguaLivre> | null>(null);
  const [erro, setErro] = useState("");

  function calcular() {
    const p = Number(peso.replace(",", "."));
    const na = Number(sodioAtual.replace(",", "."));
    const naD = Number(sodioDesejado.replace(",", "."));
    if (!p || p <= 0 || p > 300) { setErro("Peso inválido."); setResultado(null); return; }
    if (!na || na < 100 || na > 200) { setErro("Sódio atual inválido."); setResultado(null); return; }
    if (!naD || naD < 100 || naD > 200) { setErro("Sódio desejado inválido."); setResultado(null); return; }
    if (na <= naD) { setErro("Sódio atual deve ser maior que o desejado."); setResultado(null); return; }
    setErro("");
    setResultado(calcularAguaLivre({ sexo, faixaEtaria: faixa, peso: p, sodioAtual: na, sodioDesejado: naD }));
  }

  const tbwLabel = `${(getTbwFracao(sexo, faixa) * 100).toFixed(0)}% (${getTbwFracao(sexo, faixa)})`;
  const isCrianca = faixa === "crianca";

  return (
    <div className="bg-white dark:bg-[#172741] rounded-2xl border border-[#d9e3ec] dark:border-white/12 overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e6edf3] dark:border-white/12 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] overflow-hidden shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
            <path d="M20 4 C20 4 8 18 8 26 a12 12 0 0 0 24 0 C32 18 20 4 20 4Z" fill="#3db8d4" opacity="0.85"/>
            <path d="M14 27 C14 30.3 16.7 33 20 33" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">Déficit de Água Livre</p>
          <p className="text-xs text-[#0f2d4a] dark:text-[#8fa9bd]">Hipernatremia — reposição hídrica</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Faixa etária */}
        <div>
          <p className="text-xs font-semibold text-[#0f2d4a] dark:text-[#8aacbc] mb-2">Faixa etária</p>
          <div className="grid grid-cols-3 gap-2">
            {FAIXAS.map((f) => (
              <button key={f.value} type="button"
                onClick={() => { setFaixa(f.value); setResultado(null); }}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all text-center ${
                  faixa === f.value
                    ? "bg-[#3db8d4] border-[#3db8d4] text-white"
                    : "border-[#d9e3ec] dark:border-white/12 text-[#0f2d4a] dark:text-[#8aacbc] hover:border-[#3db8d4]/50"
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sexo (oculto para criança) */}
        {!isCrianca && (
          <div>
            <p className="text-xs font-semibold text-[#0f2d4a] dark:text-[#8aacbc] mb-2">Sexo biológico</p>
            <div className="flex gap-2">
              {SEXOS.map((s) => (
                <button key={s.value} type="button"
                  onClick={() => { setSexo(s.value); setResultado(null); }}
                  className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    sexo === s.value
                      ? "bg-[#3db8d4] border-[#3db8d4] text-white"
                      : "border-[#d9e3ec] dark:border-white/12 text-[#0f2d4a] dark:text-[#8aacbc] hover:border-[#3db8d4]/50"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TBW info */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f5f8fb] dark:bg-[#132842] border border-[#e6edf3] dark:border-white/12">
          <span className="text-[11px] text-[#0f2d4a] dark:text-[#8fa9bd]">Água corporal total (TBW):</span>
          <span className="text-[11px] font-bold text-[#1a6aad] dark:text-[#3db8d4]">{tbwLabel}</span>
        </div>

        {/* Peso */}
        <div>
          <label className="block text-xs font-semibold text-[#0f2d4a] dark:text-[#8aacbc] mb-1.5">Peso (kg)</label>
          <input type="text" inputMode="decimal" value={peso}
            onChange={(e) => { if (/[^0-9.,]/.test(e.target.value)) return; setPeso(e.target.value); setResultado(null); }}
            placeholder="Ex: 70"
            className="w-full px-3 py-2.5 rounded-xl border border-[#d9e3ec] dark:border-white/12 bg-[#f5f8fb] dark:bg-[#1e3654] text-sm text-[#0f2d4a] dark:text-[#e8edf5] placeholder-zinc-400 dark:placeholder-[#3a5a70] focus:outline-none focus:border-[#3db8d4]"
          />
        </div>

        {/* Sódios */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[#0f2d4a] dark:text-[#8aacbc] mb-1.5">
              Sódio atual (mEq/L)
            </label>
            <input type="text" inputMode="decimal" value={sodioAtual}
              onChange={(e) => { if (/[^0-9.,]/.test(e.target.value)) return; setSodioAtual(e.target.value); setResultado(null); }}
              placeholder="> 140"
              className="w-full px-3 py-2.5 rounded-xl border border-[#d9e3ec] dark:border-white/12 bg-[#f5f8fb] dark:bg-[#1e3654] text-sm text-[#0f2d4a] dark:text-[#e8edf5] placeholder-zinc-400 dark:placeholder-[#3a5a70] focus:outline-none focus:border-[#3db8d4]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[#0f2d4a] dark:text-[#8aacbc] mb-1.5">
              Sódio desejado (mEq/L)
            </label>
            <input type="text" inputMode="decimal" value={sodioDesejado}
              onChange={(e) => { if (/[^0-9.,]/.test(e.target.value)) return; setSodioDesejado(e.target.value); setResultado(null); }}
              placeholder="140"
              className="w-full px-3 py-2.5 rounded-xl border border-[#d9e3ec] dark:border-white/12 bg-[#f5f8fb] dark:bg-[#1e3654] text-sm text-[#0f2d4a] dark:text-[#e8edf5] placeholder-zinc-400 dark:placeholder-[#3a5a70] focus:outline-none focus:border-[#3db8d4]"
            />
          </div>
        </div>

        {erro && <p className="text-xs text-red-500">{erro}</p>}

        <button onClick={calcular}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] text-white font-bold text-sm transition-colors">
          Calcular
        </button>

        {resultado && (
          <div className="space-y-3">
            {/* Resultado principal */}
            <div className="rounded-xl border border-[#e6edf3] dark:border-white/12 bg-[#f5f8fb] dark:bg-[#132842] p-4">
              <p className="text-[11px] font-bold text-[#0f2d4a] dark:text-[#8fa9bd] uppercase tracking-widest mb-3">
                Déficit de água livre
              </p>
              <div className="flex items-end gap-2 mb-1">
                <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">
                  {resultado.deficit.toFixed(2)}
                </p>
                <p className="text-sm text-[#0f2d4a] dark:text-[#8fa9bd] mb-0.5">L total</p>
              </div>
              <p className="text-xs text-[#0f2d4a] dark:text-[#a9bccd]">
                Déficit total para atingir Na {sodioDesejado} mEq/L
              </p>
            </div>

            {/* Meta 24h */}
            <div className="rounded-xl border border-[#1a6aad]/20 dark:border-[#3db8d4]/20 bg-[#e8f4fc] dark:bg-[#0f2d4a]/30 p-4">
              <p className="text-[11px] font-bold text-[#1a6aad] dark:text-[#3db8d4] uppercase tracking-widest mb-2">
                Correção nas primeiras 24h
              </p>
              <div className="flex items-end gap-2 mb-1">
                <p className="text-3xl font-extrabold text-[#1a6aad] dark:text-[#3db8d4] leading-none">
                  {resultado.deficit24h.toFixed(2)}
                </p>
                <p className="text-sm text-[#1a6aad] dark:text-[#3db8d4] mb-0.5">L</p>
              </div>
              <p className="text-xs text-[#0f2d4a] dark:text-[#a9bccd]">
                Meta: Na {resultado.sodioMeta24h.toFixed(0)} mEq/L (máx. ↓10 mEq/L em 24h)
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
