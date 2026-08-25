"use client";

import { useState } from "react";
import { calcularNews2, type News2Input, type Consciencia } from "@/lib/calculadoras/news2";

const COR_MAP = {
  verde:    { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500", box: "border-emerald-200 dark:border-emerald-700/40 bg-emerald-50 dark:bg-emerald-900/20" },
  amarelo:  { badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",         bar: "bg-amber-500",   box: "border-amber-200 dark:border-amber-700/40 bg-amber-50 dark:bg-amber-900/20"     },
  laranja:  { badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",     bar: "bg-orange-500",  box: "border-orange-200 dark:border-orange-700/40 bg-orange-50 dark:bg-orange-900/20"  },
  vermelho: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",                 bar: "bg-red-500",     box: "border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-900/20"             },
};

const INITIAL: News2Input = {
  fr: 16, hipercapnia: false, o2suplementar: false, spo2: 97,
  pas: 120, fc: 75, consciencia: "alert", temperatura: 36.8,
};

function NumInput({ label, sublabel, value, min, max, step = 1, onChange }: {
  label: string; sublabel: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#0f2d4a] dark:text-[#8aacbc] mb-1">
        {label} <span className="font-normal text-[#0f2d4a] dark:text-[#5a7a8e]">{sublabel}</span>
      </label>
      <input type="number" min={min} max={max} step={step} value={value}
        onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }}
        className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-white/8 bg-zinc-50 dark:bg-[#1a2d45] text-sm text-[#0f2d4a] dark:text-[#e8edf5] focus:outline-none focus:border-[#3db8d4]"
      />
    </div>
  );
}

function Toggle({ label, sublabel, opcoes, value, onChange }: {
  label: string; sublabel?: string; opcoes: { v: string | boolean; l: string }[]; value: string | boolean;
  onChange: (v: any) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#0f2d4a] dark:text-[#8aacbc] mb-0.5">{label}</p>
      {sublabel && <p className="text-[10px] text-[#0f2d4a] dark:text-[#5a7a8e] mb-1.5">{sublabel}</p>}
      {!sublabel && <div className="mb-1.5" />}
      <div className="flex gap-2">
        {opcoes.map(({ v, l }) => (
          <button key={String(v)} type="button" onClick={() => onChange(v)}
            className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
              value === v
                ? "bg-[#3db8d4] border-[#3db8d4] text-white"
                : "border-zinc-200 dark:border-white/8 text-[#0f2d4a] dark:text-[#8aacbc] hover:border-[#3db8d4]/50"
            }`}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function News2Calc() {
  const [input, setInput] = useState<News2Input>(INITIAL);
  const [resultado, setResultado] = useState<ReturnType<typeof calcularNews2> | null>(null);

  function set<K extends keyof News2Input>(key: K, val: News2Input[K]) {
    setInput((v) => ({ ...v, [key]: val }));
    setResultado(null);
  }

  const cor = resultado ? COR_MAP[resultado.cor] : null;

  const PONTOS_LABELS: { key: keyof typeof resultado.pontos; label: string }[] = [
    { key: "fr",          label: "Frequência respiratória" },
    { key: "spo2",        label: "Saturação O₂"           },
    { key: "o2",          label: "O₂ suplementar"         },
    { key: "pas",         label: "PAS"                    },
    { key: "fc",          label: "Frequência cardíaca"    },
    { key: "consciencia", label: "Consciência"            },
    { key: "temperatura", label: "Temperatura"            },
  ];

  return (
    <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/8 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-[#0a1628] overflow-hidden shrink-0 flex items-center justify-center">
          <img src="/images/calculadoras/news.png" alt="NEWS2" className="w-full h-full object-contain scale-[1.4]" />
        </div>
        <div>
          <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">NEWS2</p>
          <p className="text-xs text-[#0f2d4a] dark:text-[#5a7a8e] mt-0.5">National Early Warning Score 2</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <NumInput label="FR" sublabel="irpm" value={input.fr} min={4} max={60} onChange={(v) => set("fr", v)} />
          <NumInput label="SpO₂" sublabel="%" value={input.spo2} min={50} max={100} onChange={(v) => set("spo2", v)} />
          <NumInput label="PAS" sublabel="mmHg" value={input.pas} min={50} max={250} onChange={(v) => set("pas", v)} />
          <NumInput label="FC" sublabel="bpm" value={input.fc} min={20} max={200} onChange={(v) => set("fc", v)} />
          <NumInput label="Temperatura" sublabel="°C" value={input.temperatura} min={30} max={43} step={0.1} onChange={(v) => set("temperatura", v)} />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Toggle label="Falência respiratória hipercápnica" sublabel="Ex: DPOC — usa Escala 2 para SpO₂"
            opcoes={[{ v: false, l: "Não (Escala 1)" }, { v: true, l: "Sim (Escala 2)" }]}
            value={input.hipercapnia} onChange={(v) => set("hipercapnia", v)} />
          <Toggle label="O₂ suplementar"
            opcoes={[{ v: false, l: "Não" }, { v: true, l: "Sim" }]}
            value={input.o2suplementar} onChange={(v) => set("o2suplementar", v)} />
          <Toggle label="Nível de consciência"
            sublabel="CVPU — C: nova Confusão/desorientação (mesmo que alerta) · V: responde à Voz (olhar, grunhido ou movimento) · P: responde apenas à Dor (reflexo de retirada) · U: sem resposta a voz ou dor (inconsciente)"
            opcoes={[{ v: "alert", l: "Alerta" }, { v: "cvpu", l: "CVPU" }]}
            value={input.consciencia} onChange={(v: Consciencia) => set("consciencia", v)} />
        </div>

        <button onClick={() => setResultado(calcularNews2(input))}
          className="w-full py-3 rounded-xl bg-[#3db8d4] hover:bg-[#2da8c4] text-white font-bold text-sm transition-colors">
          Calcular NEWS2
        </button>

        {resultado && cor && (
          <div className="space-y-3">
            {/* Score */}
            <div className={`rounded-xl border p-4 space-y-3 ${cor.box}`}>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-none">{resultado.total}</p>
                <p className="text-sm text-[#0f2d4a] dark:text-[#5a7a8e] mb-0.5">pontos</p>
              </div>
              <div className="h-2 w-full bg-zinc-200 dark:bg-[#1a2d45] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${cor.bar}`}
                  style={{ width: `${Math.min((resultado.total / 20) * 100, 100)}%` }} />
              </div>
              <div>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${cor.badge}`}>
                  {resultado.label}
                </span>
                <p className="text-[11px] text-[#0f2d4a] dark:text-[#6a8fa5] mt-1.5 font-medium">{resultado.resposta}</p>
              </div>
              {resultado.temItemTres && resultado.total <= 4 && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  ⚠ Um parâmetro individual atingiu 3 pontos — resposta urgente indicada
                </p>
              )}
            </div>

            {/* Detalhamento por parâmetro */}
            <div className="rounded-xl border border-zinc-100 dark:border-white/8 overflow-hidden">
              <p className="text-[11px] font-bold text-[#0f2d4a] dark:text-[#5a7a8e] uppercase tracking-widest px-4 py-2.5 border-b border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30]">
                Pontuação por parâmetro
              </p>
              {PONTOS_LABELS.map(({ key, label }) => {
                const pts = resultado.pontos[key];
                return (
                  <div key={key} className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 dark:border-white/8 last:border-0">
                    <span className="text-xs text-[#0f2d4a] dark:text-[#c4d4df]">{label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      pts === 3 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      pts === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                      pts === 1 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    }`}>
                      {pts} pt
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabela de referência */}
        <div className="rounded-xl border border-zinc-100 dark:border-white/8 overflow-hidden">
          <p className="text-[11px] font-bold text-[#0f2d4a] dark:text-[#5a7a8e] uppercase tracking-widest px-4 py-2.5 border-b border-zinc-100 dark:border-white/8 bg-zinc-50 dark:bg-[#0f1e30]">
            Interpretação NEWS2
          </p>
          {[
            { faixa: "0 – 4 pts",    sub: "sem item com 3 pts", label: "Risco clínico baixo",       resposta: "Monitorar a cada 12h (score 0) ou a cada 4–6h (score 1–4); avaliação por enfermeiro.",                             cor: "verde"    },
            { faixa: "3 – 4 pts",    sub: "com item de 3 pts",  label: "Risco clínico baixo-médio", resposta: "Revisão urgente pelo médico da enfermaria; reavaliar frequência de monitorização ou escalonamento de cuidado.",      cor: "amarelo"  },
            { faixa: "5 – 6 pts",    sub: "",                   label: "Risco clínico médio",        resposta: "Revisão urgente pelo médico ou enfermeiro; avaliar necessidade de encaminhar paciente para leito de UTI.",               cor: "laranja"  },
            { faixa: "≥ 7 pts",      sub: "",                   label: "Risco clínico alto",         resposta: "Avaliação emergencial pela equipe clínica ou UTI; geralmente é necessária transferência para nível mais alto de cuidado/suporte (exemplo: leito de UTI).",       cor: "vermelho" },
          ].map((linha, i) => {
            const ativo = resultado?.risco === (["baixo","baixo-medio","medio","alto"][i]);
            return (
              <div key={i} className={`px-4 py-2.5 border-b border-zinc-100 dark:border-white/8 last:border-0 transition-colors ${
                ativo ? COR_MAP[linha.cor as keyof typeof COR_MAP].badge : ""
              }`}>
                <div className="flex items-start gap-3">
                  <div className="w-36 shrink-0 pt-0.5">
                    <span className={`text-[11px] font-mono font-bold ${ativo ? "" : "text-[#0f2d4a] dark:text-[#9ec4de]"}`}>{linha.faixa}</span>
                    {linha.sub && <p className={`text-[10px] font-mono ${ativo ? "opacity-80" : "text-[#0f2d4a] dark:text-[#5a7a8e]"}`}>{linha.sub}</p>}
                  </div>
                  <span className={`text-[11px] flex-1 leading-relaxed ${ativo ? "font-semibold" : "text-[#0f2d4a] dark:text-[#6a8fa5]"}`}>{linha.resposta}</span>
                  {ativo && <span className="text-[10px] shrink-0">◀</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
